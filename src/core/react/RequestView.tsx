import React, { useEffect, useState } from "react";
import { ChevronRight, Download, Play, Plus, Square, Star } from "lucide-react";
import { bodyExample, downloadBlob, exampleFor, resolveRef } from "./api";
import {
  CodeEditor,
  CopyButton,
  IconButton,
  KeyValueEditor,
  Markdown,
  Method,
} from "./ui";
import type {
  Draft,
  Notify,
  OpenApiDocument,
  Operation,
  ResponseData,
} from "./types";

interface RequestViewProps {
  operation: Operation;
  spec: OpenApiDocument;
  draft: Draft;
  onChange: (patch: Draft) => void;
  onSend: (files: Record<string, File | undefined>) => void;
  onCancel: () => void;
  response?: ResponseData;
  pending?: boolean;
  favorite?: boolean;
  onFavorite: () => void;
  onAddToCollection: () => void;
  notify?: Notify;
  files?: Record<string, File | undefined>;
  onFile?: (name: string, file?: File) => void;
  onAuth: () => void;
}

export function RequestView({
  operation,
  spec,
  draft,
  onChange,
  onSend,
  onCancel,
  response,
  pending,
  favorite,
  onFavorite,
  onAddToCollection,
  notify,
  files = {},
  onFile,
  onAuth,
}: RequestViewProps) {
  const [tab, setTab] = useState("Parameters");
  const [responseTab, setResponseTab] = useState("Body");
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!response?.blob || !response.contentType?.startsWith("image/")) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(response.blob);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [response]);
  const contentTypes = Object.keys(operation.requestBody?.content || {});
  return (
    <div className="request-view">
      <header className="request-heading">
        <div>
          <div className="eyebrow">{operation.tags?.[0] || "Requests"}</div>
          <h1>
            {operation.summary || operation.operationId || operation.path}
          </h1>
        </div>
        <div className="actions">
          <IconButton
            label={favorite ? "Remove favorite" : "Add favorite"}
            aria-pressed={favorite}
            onClick={onFavorite}
          >
            <Star size={18} fill={favorite ? "currentColor" : "none"} />
          </IconButton>
          <IconButton label="Add request to runner" onClick={onAddToCollection}>
            <Plus size={19} />
          </IconButton>
        </div>
      </header>
      <form
        className="request-url"
        onSubmit={(event) => {
          event.preventDefault();
          onSend(files);
        }}
      >
        <Method method={operation.method} />
        <input
          aria-label="Request path"
          value={draft.path || ""}
          onChange={(event) => onChange({ path: event.target.value })}
        />
        {pending ? (
          <button type="button" className="primary" onClick={onCancel}>
            <Square size={15} />
            Cancel
          </button>
        ) : (
          <button type="submit" className="primary">
            <Play size={16} />
            Send
          </button>
        )}
      </form>
      <div className="subtabs" role="tablist" aria-label="Request details">
        {[
          "Parameters",
          "Headers",
          "Body",
          "Documentation",
          "Output variables",
        ].map((name) => (
          <button
            role="tab"
            aria-selected={tab === name}
            key={name}
            onClick={() => setTab(name)}
          >
            {name}
            {name === "Parameters" && draft.parameters?.length > 0 && (
              <span className="count">{draft.parameters.length}</span>
            )}
          </button>
        ))}
        <button className="auth-link" onClick={onAuth}>
          Authorization{operation.security.length ? " *" : ""}
        </button>
      </div>
      <section className="request-details" role="tabpanel" aria-label={tab}>
        {tab === "Parameters" && (
          <KeyValueEditor
            rows={draft.parameters}
            onChange={(parameters) => onChange({ parameters })}
            locations
            addLabel="Add parameter"
          />
        )}
        {tab === "Headers" && (
          <KeyValueEditor
            rows={draft.headers}
            onChange={(headers) => onChange({ headers })}
            addLabel="Add header"
          />
        )}
        {tab === "Body" && (
          <>
            <div className="body-toolbar">
              <label>
                Content type{" "}
                <select
                  aria-label="Content type"
                  value={draft.contentType || ""}
                  onChange={(event) => {
                    const contentType = event.target.value;
                    const schema = resolveRef(
                      operation.requestBody?.content?.[contentType]?.schema,
                      spec,
                    );
                    onChange({
                      contentType,
                      body: bodyExample(operation, spec, contentType),
                      form: Object.entries(schema.properties || {}).map(
                        ([name, value]: [string, any]) => ({
                          name,
                          value: value.default ?? "",
                          enabled: true,
                          file:
                            value.format === "binary" || value.type === "file",
                        }),
                      ),
                    });
                  }}
                >
                  <option value="">None</option>
                  {[
                    ...new Set([
                      ...contentTypes,
                      "application/json",
                      "text/plain",
                      "application/xml",
                      "application/x-www-form-urlencoded",
                      "multipart/form-data",
                    ]),
                  ].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <button
                className="text-button"
                onClick={() =>
                  onChange({
                    body: bodyExample(operation, spec, draft.contentType),
                  })
                }
              >
                Reset example
              </button>
            </div>
            {[
              "multipart/form-data",
              "application/x-www-form-urlencoded",
            ].includes(draft.contentType) ? (
              <KeyValueEditor
                rows={draft.form}
                onChange={(form) => onChange({ form })}
                files={draft.contentType === "multipart/form-data"}
                onFile={onFile}
                addLabel="Add field"
              />
            ) : (
              <CodeEditor
                label="Request body"
                value={draft.body}
                onChange={(body) => onChange({ body })}
                language={
                  draft.contentType?.includes("json")
                    ? "json"
                    : draft.contentType?.includes("xml")
                      ? "xml"
                      : "plaintext"
                }
              />
            )}
          </>
        )}
        {tab === "Documentation" && (
          <div className="documentation">
            <Markdown>{operation.description || operation.summary}</Markdown>
            {operation.deprecated && (
              <p className="warning">Deprecated operation</p>
            )}
            {operation.parameters.map((param) => (
              <div className="parameter-doc" key={`${param.in}:${param.name}`}>
                <strong>{param.name}</strong>
                <code>{param.in}</code>
                {param.required && <span className="required">required</span>}
                <Markdown>{param.description}</Markdown>
                <pre>{JSON.stringify(param.schema || param, null, 2)}</pre>
              </div>
            ))}
            {operation.requestBody && (
              <details>
                <summary>
                  <ChevronRight className="expand-chevron" size={14} />
                  Request schema
                </summary>
                <pre>{JSON.stringify(operation.requestBody, null, 2)}</pre>
              </details>
            )}
            {Object.entries(operation.responses || {}).map(
              ([status, value]) => {
                const responseSpec = resolveRef(value, spec);
                const media: any = Object.values(responseSpec.content || {})[0];
                return (
                  <details key={status}>
                    <summary>
                      <ChevronRight className="expand-chevron" size={14} />
                      <strong>{status}</strong> {responseSpec.description}
                    </summary>
                    <pre>
                      {JSON.stringify(
                        media?.example ??
                          (media?.schema || responseSpec.schema
                            ? exampleFor(
                                media?.schema || responseSpec.schema,
                                spec,
                              )
                            : responseSpec),
                        null,
                        2,
                      )}
                    </pre>
                    {media?.schema && (
                      <pre>{JSON.stringify(media.schema, null, 2)}</pre>
                    )}
                  </details>
                );
              },
            )}
          </div>
        )}
        {tab === "Output variables" && (
          <KeyValueEditor
            rows={draft.outputs}
            onChange={(outputs) => onChange({ outputs })}
            outputs
            valueLabel="JSONPath"
            addLabel="Add output variable"
          />
        )}
      </section>
      <section className="response-section" aria-label="Response">
        <header className="response-heading">
          <h2>Response</h2>
          {pending && <span role="status">Sending request...</span>}
          {response && (
            <div className="response-meta">
              <strong className={response.ok ? "success" : "error-text"}>
                {response.status} {response.statusText}
              </strong>
              <span>{response.duration} ms</span>
              <span>{response.size?.toLocaleString()} B</span>
              {response.blob && (
                <IconButton
                  label="Download response"
                  onClick={() =>
                    downloadBlob(
                      response.blob,
                      response.headers?.["content-disposition"]?.match(
                        /filename="?([^";]+)/,
                      )?.[1] || "response",
                    )
                  }
                >
                  <Download size={16} />
                </IconButton>
              )}
              <CopyButton value={response.body || ""} notify={notify} />
            </div>
          )}
        </header>
        {!response && !pending && (
          <div className="response-empty">
            <Play size={28} strokeWidth={1} />
            <span>No response yet</span>
          </div>
        )}
        {response && (
          <>
            <div
              className="subtabs"
              role="tablist"
              aria-label="Response details"
            >
              {["Body", "Headers", "Request"].map((name) => (
                <button
                  key={name}
                  role="tab"
                  aria-selected={responseTab === name}
                  onClick={() => setResponseTab(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            {responseTab === "Body" &&
              (preview ? (
                <img
                  className="response-image"
                  src={preview}
                  alt="API response"
                />
              ) : response.binary ? (
                <p className="empty">
                  Binary response ({response.contentType})
                </p>
              ) : (
                <CodeEditor
                  label="Response body"
                  readOnly
                  value={response.body}
                  language={
                    response.contentType?.includes("json")
                      ? "json"
                      : "plaintext"
                  }
                />
              ))}
            {responseTab === "Headers" && (
              <dl className="response-headers">
                {Object.entries(response.headers || {}).map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {responseTab === "Request" && <pre>{response.request}</pre>}
          </>
        )}
      </section>
    </div>
  );
}

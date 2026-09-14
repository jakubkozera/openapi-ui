import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Download,
  Play,
  Plus,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { downloadBlob } from "./api";
import { IconButton, Method } from "./ui";
import type {
  Draft,
  Notify,
  Operation,
  RequestCollection,
  ResponseData,
  SavedRequest,
  Variables,
} from "./types";

interface RunnerProps {
  collections: RequestCollection[];
  onChange: (collections: RequestCollection[]) => void;
  operations: Operation[];
  onOpen?: (
    operation: Operation | undefined,
    draft: Draft,
    saved: SavedRequest,
  ) => void;
  execute: (
    operation: Operation,
    draft: Draft,
    variables: Variables,
    signal: AbortSignal,
  ) => Promise<{ response: ResponseData; variables: Variables }>;
  variables: Variables;
  notify: Notify;
}

interface RunnerResult extends ResponseData {
  id: string;
  name: string;
}

export function Runner({
  collections,
  onChange,
  operations,
  onOpen = () => {},
  execute,
  variables,
  notify,
}: RunnerProps) {
  const [selected, setSelected] = useState(collections[0]?.id || "");
  const [name, setName] = useState("New collection");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RunnerResult[]>([]);
  const [stopOnError, setStopOnError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const collection =
    collections.find((item) => item.id === selected) || collections[0];
  useEffect(() => () => controller.current?.abort(), []);
  const update = (patch: Partial<RequestCollection>) =>
    collection &&
    onChange(
      collections.map((item) =>
        item.id === collection.id ? { ...item, ...patch } : item,
      ),
    );
  const move = (index: number, offset: number) => {
    const requests = [...collection.requests];
    const target = index + offset;
    if (target < 0 || target >= requests.length) return;
    [requests[index], requests[target]] = [requests[target], requests[index]];
    update({ requests });
  };
  async function run() {
    const abort = new AbortController();
    controller.current = abort;
    setRunning(true);
    setResults([]);
    let currentVariables = variables;
    try {
      for (const request of collection.requests.filter(
        (item) => item.enabled !== false,
      )) {
        if (abort.signal.aborted) break;
        const operation = operations.find(
          (item) => item.id === request.operationId,
        );
        if (!operation) {
          notify(`Operation no longer exists: ${request.operationId}`, true);
          continue;
        }
        const result = await execute(
          operation,
          request.draft,
          currentVariables,
          abort.signal,
        );
        if (abort.signal.aborted) break;
        currentVariables = result.variables;
        setResults((previous) => [
          ...previous,
          {
            ...result.response,
            id: request.id,
            name: operation.summary || operation.path,
          },
        ]);
        if (stopOnError && !result.response.ok) break;
        if ((collection.delay || 0) > 0)
          await new Promise<void>((resolve) => {
            const finish = () => {
              clearTimeout(timer);
              abort.signal.removeEventListener("abort", finish);
              resolve();
            };
            const timer = setTimeout(
              finish,
              Math.min(collection.delay || 0, 60000),
            );
            abort.signal.addEventListener("abort", finish, { once: true });
          });
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        notify(error instanceof Error ? error.message : String(error), true);
    } finally {
      setRunning(false);
      controller.current = null;
    }
  }
  return (
    <section className="tool-view runner">
      <header className="section-heading">
        <h1>Collection runner</h1>
        <div className="actions">
          <IconButton
            label="Import saved collection"
            disabled={running}
            onClick={() => importInput.current?.click()}
          >
            <Upload size={17} />
          </IconButton>
          <IconButton
            label="Export collection"
            disabled={!collection}
            onClick={() =>
              downloadBlob(
                new Blob([JSON.stringify(collection, null, 2)], {
                  type: "application/json",
                }),
                `${collection.name}.json`,
              )
            }
          >
            <Download size={17} />
          </IconButton>
        </div>
      </header>
      <input
        ref={importInput}
        hidden
        type="file"
        accept=".json"
        onChange={async (event) => {
          try {
            const file = event.target.files?.[0];
            if (!file) return;
            const imported = JSON.parse(await file.text());
            if (
              !imported.name ||
              !Array.isArray(imported.requests) ||
              imported.requests.some(
                (item: any) =>
                  !item?.draft ||
                  !operations.some(
                    (operation) => operation.id === item.operationId,
                  ),
              )
            )
              throw new Error(
                "Invalid collection or operations not present in this specification.",
              );
            const entry = { ...imported, id: crypto.randomUUID() };
            onChange([...collections, entry]);
            setSelected(entry.id);
          } catch (error) {
            notify(
              error instanceof Error ? error.message : String(error),
              true,
            );
          }
        }}
      />
      <div className="collection-controls">
        <label>
          Collection
          <select
            disabled={running}
            value={collection?.id || ""}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="" disabled>
              Select a collection
            </option>
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          New collection
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <IconButton
          label="Create collection"
          disabled={!name.trim() || running}
          onClick={() => {
            const entry = {
              id: crypto.randomUUID(),
              name: name.trim(),
              requests: [],
              delay: 0,
            };
            onChange([...collections, entry]);
            setSelected(entry.id);
          }}
        >
          <Plus size={19} />
        </IconButton>
      </div>
      {collection ? (
        <>
          <div className="runner-toolbar">
            <label>
              Delay (ms)
              <input
                type="number"
                min="0"
                max="60000"
                step="100"
                disabled={running}
                value={collection.delay || 0}
                onChange={(event) =>
                  update({
                    delay: Math.max(
                      0,
                      Math.min(Number(event.target.value), 60000),
                    ),
                  })
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={stopOnError}
                onChange={(event) => setStopOnError(event.target.checked)}
              />
              Stop on error
            </label>
            <IconButton
              label="Delete collection"
              disabled={running}
              onClick={() =>
                onChange(
                  collections.filter((item) => item.id !== collection.id),
                )
              }
            >
              <Trash2 size={17} />
            </IconButton>
            {running ? (
              <button
                className="primary"
                onClick={() => controller.current?.abort()}
              >
                <Square size={15} />
                Stop
              </button>
            ) : (
              <button
                className="primary"
                disabled={
                  !collection.requests.some((item) => item.enabled !== false)
                }
                onClick={run}
              >
                <Play size={16} />
                Run
              </button>
            )}
          </div>
          <div className="runner-requests">
            {collection.requests.map((request, index) => {
              const operation = operations.find(
                (item) => item.id === request.operationId,
              );
              return (
                <div className="runner-row" key={request.id}>
                  <input
                    type="checkbox"
                    aria-label={`Enable request ${index + 1}`}
                    disabled={running}
                    checked={request.enabled !== false}
                    onChange={(event) =>
                      update({
                        requests: collection.requests.map((item) =>
                          item.id === request.id
                            ? { ...item, enabled: event.target.checked }
                            : item,
                        ),
                      })
                    }
                  />
                  <span className="muted">{index + 1}</span>
                  <button
                    className="runner-request"
                    onClick={() =>
                      onOpen(operation, request.draft, {
                        collectionId: collection.id,
                        requestId: request.id,
                      })
                    }
                    disabled={!operation || running}
                  >
                    <Method method={operation?.method || "get"} />
                    <span>{operation?.summary || request.operationId}</span>
                  </button>
                  <IconButton
                    label={`Move request ${index + 1} up`}
                    disabled={running || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </IconButton>
                  <IconButton
                    label={`Move request ${index + 1} down`}
                    disabled={
                      running || index === collection.requests.length - 1
                    }
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </IconButton>
                  <IconButton
                    label={`Remove request ${index + 1}`}
                    disabled={running}
                    onClick={() =>
                      update({
                        requests: collection.requests.filter(
                          (item) => item.id !== request.id,
                        ),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              );
            })}
          </div>
          {!collection.requests.length && (
            <p className="empty">No requests in this collection.</p>
          )}
          {results.length > 0 && (
            <section>
              <h2>
                Results <span className="count">{results.length}</span>
              </h2>
              {results.map((result, index) => (
                <details key={`${result.id}:${index}`}>
                  <summary>
                    <ChevronRight className="expand-chevron" size={14} />
                    <strong className={result.ok ? "success" : "error-text"}>
                      {result.status || "Error"}
                    </strong>
                    <span>{result.name}</span>
                    <span>{result.duration} ms</span>
                  </summary>
                  <pre>{result.body}</pre>
                </details>
              ))}
              <button
                className="text-button"
                onClick={() =>
                  downloadBlob(
                    new Blob(
                      [
                        JSON.stringify(
                          results.map(({ blob, ...result }) => result),
                          null,
                          2,
                        ),
                      ],
                      { type: "application/json" },
                    ),
                    "runner-results.json",
                  )
                }
              >
                <Download size={16} />
                Export results
              </button>
            </section>
          )}
        </>
      ) : (
        <p className="empty">No saved collections.</p>
      )}
    </section>
  );
}

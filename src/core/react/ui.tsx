import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Editor, { loader } from "@monaco-editor/react";
import { createPortal } from "react-dom";
import type { editor as MonacoEditor } from "monaco-editor";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { Copy, Info, Plus, Trash2, X } from "lucide-react";
import type { KeyValueRow, Notify, Variables } from "./types";
import {
  bindVariableDecorations,
  referenceDescription,
} from "./variableDecorations";
import { variableReferences } from "./api";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs",
  },
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function PlayIcon({
  size = 16,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-icon="codicon-play"
      {...props}
    >
      <path d="M4.74514 3.06414C4.41183 2.87665 4 3.11751 4 3.49993V12.5002C4 12.8826 4.41182 13.1235 4.74512 12.936L12.7454 8.43601C13.0852 8.24486 13.0852 7.75559 12.7454 7.56443L4.74514 3.06414ZM3 3.49993C3 2.35268 4.2355 1.63011 5.23541 2.19257L13.2357 6.69286C14.2551 7.26633 14.2551 8.73415 13.2356 9.30759L5.23537 13.8076C4.23546 14.37 3 13.6474 3 12.5002V3.49993Z" />
    </svg>
  );
}

export function IconButton({ label, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className="icon-button"
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}

export function InfoTip({
  label,
  children,
  trigger,
  active = true,
}: {
  label: string;
  children: ReactNode;
  trigger?: ReactNode;
  active?: boolean;
}) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    above: boolean;
  } | null>(null);
  const show = () => {
    if (!active) return;
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    const above = rect.bottom > window.innerHeight / 2;
    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 368)),
      top: above ? rect.top - 6 : rect.bottom + 6,
      above,
    });
  };
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);
  return (
    <span
      ref={anchor}
      className={`info-tip${trigger ? " variable-input" : ""}`}
      onMouseEnter={show}
      onMouseLeave={() => setPosition(null)}
      onFocus={show}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPosition(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setPosition(null);
      }}
    >
      {trigger}
      {active && (
        <IconButton
          label={label}
          title={undefined}
          aria-describedby={position ? id : undefined}
          onClick={show}
        >
          <Info size={14} />
        </IconButton>
      )}
      {active &&
        position &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            className="info-tooltip"
            style={{
              left: position.left,
              top: position.top,
              transform: position.above ? "translateY(-100%)" : undefined,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </span>
  );
}

export function VariableHelp() {
  return (
    <InfoTip label="Variable syntax help">
      Use <code>{"{{name}}"}</code> for an enabled variable from Variables, or{" "}
      <code>{"{{@name}}"}</code> for a value extracted from a previous response.
      Variables are substituted in the server URL, request path, parameters,
      headers and body when sending. Run the request defining an output first.
    </InfoTip>
  );
}

export function VariableInput({
  variables,
  outputDefinitions,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  variables?: Variables;
  outputDefinitions?: KeyValueRow[];
}) {
  const references = variables
    ? variableReferences(props.value, variables, outputDefinitions)
    : [];
  if (!variables) return <input {...props} />;
  const status = references.some((reference) => reference.status === "missing")
    ? "missing"
    : references.some((reference) => reference.status === "pending")
      ? "pending"
      : "resolved";
  return (
    <InfoTip
      label={`Variable values for ${props["aria-label"] || "field"}`}
      active={references.length > 0}
      trigger={
        <input
          {...props}
          className={`${references.length ? `variable-field-${status}` : ""} ${props.className || ""}`}
        />
      }
    >
      {references.map((reference) => (
        <div key={reference.start} className="variable-preview">
          {referenceDescription(reference)}
        </div>
      ))}
    </InfoTip>
  );
}

export function Method({ method }: { method: string }) {
  return (
    <span className={`method method-${method.toLowerCase()}`}>
      {method.toUpperCase()}
    </span>
  );
}

export function Markdown({ children }: { children?: ReactNode }) {
  const html = marked.parse(String(children || ""), { async: false }) as string;
  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, {
          FORBID_TAGS: ["img", "style", "iframe"],
          FORBID_ATTR: ["style"],
        }),
      }}
    />
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <header className="section-heading">
        <h2>{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </header>
      {children}
    </dialog>
  );
}

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  label?: string;
  variables?: Variables;
  outputDefinitions?: KeyValueRow[];
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  label = "Code editor",
  variables,
  outputDefinitions,
}: CodeEditorProps) {
  const [editor, setEditor] =
    useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [monaco, setMonaco] = useState<Awaited<
    ReturnType<typeof loader.init>
  > | null>(null);
  useEffect(() => {
    if (import.meta.env?.MODE === "test") return;
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setOffline(true);
    }, 6000);
    loader
      .init()
      .then(() => {
        if (mounted) {
          clearTimeout(timeout);
          setReady(true);
        }
      })
      .catch(() => {
        if (mounted) setOffline(true);
      });
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);
  useEffect(() => {
    if (!monaco) return;
    const sync = () => {
      const style = getComputedStyle(document.body);
      const dark =
        style.getPropertyValue("--color-scheme").trim() === "dark" ||
        document.body.classList.contains("vscode-dark") ||
        document.body.classList.contains("vscode-high-contrast");
      const color = (name: string, fallback: string) => {
        const value = style.getPropertyValue(name).trim();
        if (/^#[0-9a-f]{6}$/i.test(value)) return value;
        const match = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return match
          ? `#${match
              .slice(1)
              .map((channel) => Number(channel).toString(16).padStart(2, "0"))
              .join("")}`
          : fallback;
      };
      monaco.editor.defineTheme("openapi-ui", {
        base: dark ? "vs-dark" : "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": color("--surface", dark ? "#1e1e1e" : "#ffffff"),
          "editor.foreground": color("--text", dark ? "#cccccc" : "#242424"),
        },
      });
      monaco.editor.setTheme("openapi-ui");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-theme"],
    });
    return () => observer.disconnect();
  }, [monaco]);
  useEffect(() => {
    if (!editor || !monaco || !variables || readOnly) return;
    return bindVariableDecorations(
      editor,
      monaco,
      variables,
      outputDefinitions,
    );
  }, [editor, monaco, variables, outputDefinitions, readOnly]);
  return (
    <div className="code-editor" aria-label={label}>
      {ready && !offline ? (
        <Editor
          height="100%"
          language={language}
          value={value || ""}
          onChange={(next) => onChange?.(next || "")}
          onMount={(mountedEditor, instance) => {
            setEditor(mountedEditor);
            setMonaco(instance);
          }}
          options={{
            readOnly,
            automaticLayout: true,
            fixedOverflowWidgets: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "JetBrains Mono",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            ariaLabel: label,
            padding: { top: 12 },
            tabSize: 2,
          }}
        />
      ) : (
        <textarea
          aria-label={label}
          spellCheck="false"
          readOnly={readOnly}
          value={value || ""}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
    </div>
  );
}

export function CopyButton({
  value,
  notify,
}: {
  value: string;
  notify?: Notify;
}) {
  return (
    <IconButton
      label="Copy to clipboard"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          notify?.("Copied");
        } catch {
          notify?.("Clipboard unavailable. Select and copy the text.", true);
        }
      }}
    >
      <Copy size={16} />
    </IconButton>
  );
}

interface KeyValueEditorProps {
  rows?: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  nameLabel?: string;
  valueLabel?: string;
  addLabel?: string;
  locations?: boolean;
  outputs?: boolean;
  files?: boolean;
  onFile?: (name: string, file?: File) => void;
  variables?: Variables;
  outputDefinitions?: KeyValueRow[];
}

export function KeyValueEditor({
  rows = [],
  onChange,
  nameLabel = "Name",
  valueLabel = "Value",
  addLabel = "Add row",
  locations = false,
  outputs = false,
  files,
  onFile,
  variables,
  outputDefinitions,
}: KeyValueEditorProps) {
  const update = (index: number, patch: Partial<KeyValueRow>) =>
    onChange(
      rows.map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    );
  return (
    <div className="key-values">
      <div className="kv-heading">
        <span>
          {nameLabel}
          {outputs && (
            <InfoTip label="Output variable name help">
              Enter a name without braces or @, for example <code>petId</code>.
              After extracting it from a response, use{" "}
              <code>{"{{@petId}}"}</code> in a later request.
            </InfoTip>
          )}
        </span>
        <span>
          {valueLabel}
          {outputs && (
            <InfoTip label="Output variable JSONPath help">
              Use JSONPath to select a response value, for example{" "}
              <code>$.data.id</code> or <code>$.items[0].id</code>. The first
              match is stored after a successful request with a JSON response.
              Run it before requests that use this output. JSONPath scripts are
              disabled.
            </InfoTip>
          )}
        </span>
      </div>
      {rows.map((row, index) => (
        <div className="kv-row" key={index}>
          {!outputs && (
            <input
              type="checkbox"
              aria-label={`Enable ${row.name || index + 1}`}
              checked={row.enabled !== false}
              disabled={row.required}
              onChange={(event) =>
                update(index, { enabled: event.target.checked })
              }
            />
          )}
          <div className="kv-name">
            <VariableInput
              aria-label={`${nameLabel} ${index + 1}`}
              variables={variables}
              outputDefinitions={outputDefinitions}
              value={row.name || ""}
              readOnly={row.required}
              onChange={(event) => update(index, { name: event.target.value })}
              placeholder={nameLabel}
            />
            {row.required && <span className="required">required</span>}
          </div>
          {locations && (
            <select
              aria-label={`Location ${index + 1}`}
              value={row.location || "query"}
              onChange={(event) =>
                update(index, { location: event.target.value })
              }
            >
              <option value="query">Query</option>
              <option value="path">Path</option>
              <option value="header">Header</option>
              <option value="cookie">Cookie</option>
            </select>
          )}
          {row.file ? (
            <input
              type="file"
              aria-label={`File ${row.name}`}
              onChange={(event) => onFile?.(row.name, event.target.files?.[0])}
            />
          ) : (
            <VariableInput
              aria-label={`${valueLabel} ${row.name || index + 1}`}
              variables={variables}
              outputDefinitions={outputDefinitions}
              value={(outputs ? row.path : row.value) ?? ""}
              onChange={(event) =>
                update(index, {
                  [outputs ? "path" : "value"]: event.target.value,
                })
              }
              placeholder={outputs ? "$.data.id" : valueLabel}
            />
          )}
          {files && (
            <select
              aria-label={`Type ${row.name || index + 1}`}
              value={row.file ? "file" : "text"}
              onChange={(event) =>
                update(index, { file: event.target.value === "file" })
              }
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          )}
          <IconButton
            label={`Remove ${row.name || "row " + (index + 1)}`}
            disabled={row.required}
            onClick={() =>
              onChange(rows.filter((item, position) => position !== index))
            }
          >
            <Trash2 size={15} />
          </IconButton>
        </div>
      ))}
      <button
        className="text-button"
        onClick={() =>
          onChange([
            ...rows,
            {
              name: "",
              value: "",
              enabled: true,
              ...(locations ? { location: "query" } : {}),
              ...(outputs ? { path: "" } : {}),
            },
          ])
        }
      >
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  );
}

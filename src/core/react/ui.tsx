import React, {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import Editor, { loader } from "@monaco-editor/react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { Copy, Plus, Trash2, X } from "lucide-react";
import type { KeyValueRow, Notify } from "./types";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs",
  },
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
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
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  label = "Code editor",
}: CodeEditorProps) {
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
  return (
    <div className="code-editor" aria-label={label}>
      {ready && !offline ? (
        <Editor
          height="100%"
          language={language}
          value={value || ""}
          onChange={(next) => onChange?.(next || "")}
          onMount={(editor, instance) => setMonaco(instance)}
          options={{
            readOnly,
            automaticLayout: true,
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
        <span>{nameLabel}</span>
        <span>{valueLabel}</span>
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
            <input
              aria-label={`${nameLabel} ${index + 1}`}
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
            <input
              aria-label={`${valueLabel} ${row.name || index + 1}`}
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

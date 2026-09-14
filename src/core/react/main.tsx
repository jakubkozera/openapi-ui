import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import "./code-font.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error)
      return (
        <main className="startup">
          <h1>Unable to open this collection</h1>
          <p role="alert">{this.state.error.message}</p>
          <button onClick={() => location.reload()}>Reload</button>
        </main>
      );
    return this.props.children;
  }
}

const configured = document.querySelector<HTMLMetaElement>(
  'meta[name="openapi-source"]',
)?.content;
const source =
  !configured || configured.startsWith("#") ? "swagger.json" : configured;
const root = document.getElementById("root");
if (!root) throw new Error("OpenAPI UI root element is missing.");
createRoot(root).render(
  <ErrorBoundary>
    <App initialSource={source} />
  </ErrorBoundary>,
);

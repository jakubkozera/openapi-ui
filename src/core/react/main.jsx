import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="startup"><h1>Unable to open this collection</h1><p role="alert">{this.state.error.message}</p><button onClick={() => location.reload()}>Reload</button></main>;
    return this.props.children;
  }
}

const configured = document.querySelector('meta[name="openapi-source"]')?.content;
const source = !configured || configured.startsWith('#') ? 'swagger.json' : configured;
createRoot(document.getElementById('root')).render(<ErrorBoundary><App initialSource={source} /></ErrorBoundary>);
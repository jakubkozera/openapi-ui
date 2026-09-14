import React, { useState } from 'react';
import { Download, FileCode2, Play, Trash2, Upload } from 'lucide-react';
import { CSharpApiGenerator } from '../js/codeApiGenerators/csharpApiClientGenerator';
import { JavaScriptApiGenerator } from '../js/codeApiGenerators/javascriptApiClientGenerator';
import { CodeSnippetGenerator } from '../js/codeSnippets';
import { buildRequest, downloadBlob, parseSpec } from './api';
import { CodeEditor, CopyButton, IconButton, KeyValueEditor, Markdown, Method, Modal } from './ui';

export function Overview({ spec, operations, onOpen, onRunner }) {
  const groups = [...new Set(operations.flatMap(operation => operation.tags?.length ? operation.tags : ['Requests']))];
  return <section className="overview">
    <div className="eyebrow">Collection overview</div>
    <header className="overview-heading"><div><h1>{spec.info?.title || 'Untitled API'}</h1><div className="collection-meta"><span>{String(spec.info?.version || '1.0').replace(/^v?/, 'v')}</span><span>OpenAPI {spec.openapi || spec.swagger}</span>{spec.info?.license?.name && <span>{spec.info.license.name}</span>}</div></div><button className="primary" onClick={onRunner}><Play size={16} />Run collection</button></header>
    <Markdown>{spec.info?.description}</Markdown>
    <div className="collection-stats"><div><strong>{operations.length}</strong><span>Requests</span></div><div><strong>{groups.length}</strong><span>Groups</span></div><div><strong>{Object.keys(spec.components?.schemas || spec.definitions || {}).length}</strong><span>Schemas</span></div></div>
    <section className="endpoint-list"><header className="section-heading"><h2>Requests</h2><span className="muted">{operations.length} operations</span></header>{groups.map(group => <details key={group} open><summary>{group}<span className="count">{operations.filter(operation => (operation.tags || ['Requests']).includes(group)).length}</span></summary>{operations.filter(operation => (operation.tags?.length ? operation.tags : ['Requests']).includes(group)).map(operation => <button className="endpoint-row" key={operation.id} onClick={() => onOpen(operation)}><Method method={operation.method} /><code>{operation.path}</code><span>{operation.summary}</span></button>)}</details>)}</section>
    {Object.entries(spec.components?.schemas || spec.definitions || {}).length > 0 && <section className="schemas"><h2>Schemas</h2>{Object.entries(spec.components?.schemas || spec.definitions).map(([name, schema]) => <details key={name}><summary><FileCode2 size={16} />{name}</summary><pre>{JSON.stringify(schema, null, 2)}</pre></details>)}</section>}
    {spec.info?.contact && <footer className="collection-contact">{spec.info.contact.name}{spec.info.contact.email && <a href={`mailto:${spec.info.contact.email}`}>{spec.info.contact.email}</a>}</footer>}
  </section>;
}

export function Variables({ variables, onChange }) {
  return <section className="tool-view"><header className="section-heading"><h1>Variables</h1><span className="count">{variables.length}</span></header><KeyValueEditor rows={variables} onChange={onChange} addLabel="Add variable" /></section>;
}

export function History({ history, onOpen, onClear }) {
  return <section className="tool-view"><header className="section-heading"><h1>History</h1><IconButton label="Clear history" onClick={onClear}><Trash2 size={17} /></IconButton></header>{history.length === 0 ? <p className="empty">No requests in history.</p> : history.map(entry => <button className="history-row" key={entry.id} onClick={() => onOpen(entry.operationId)}><Method method={entry.method} /><div><code>{entry.path}</code><span>{new Date(entry.at).toLocaleString()}</span></div><span className={entry.status >= 200 && entry.status < 400 ? 'success' : 'error-text'}>{entry.status || 'Error'}</span><span className="muted">{entry.duration} ms</span></button>)}</section>;
}

export function ImportSpec({ onImport, onClose, notify }) {
  const [tab, setTab] = useState('URL');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  async function importValue(source, text) {
    setBusy(true);
    try {
      let specText = text;
      if (specText === undefined) {
        const url = new URL(source, location.href);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS specification URLs are supported.');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        specText = await response.text();
        source = url.href;
      }
      onImport(parseSpec(specText), source, specText);
      onClose();
    } catch (error) { notify(error.message, true); }
    finally { setBusy(false); }
  }
  return <Modal title="Import collection" onClose={onClose}><div className="subtabs" role="tablist" aria-label="Import source">{['URL', 'File', 'Paste', 'Examples'].map(name => <button role="tab" aria-selected={tab === name} key={name} onClick={() => { setTab(name); setValue(''); }}>{name}</button>)}</div>
    <div className="import-content">{tab === 'URL' && <label>Specification URL<input type="url" value={value} onChange={event => setValue(event.target.value)} placeholder="https://api.example.com/openapi.json" /></label>}
      {tab === 'File' && <label className="file-import"><Upload size={26} /><span>OpenAPI JSON or YAML</span><input aria-label="Specification file" type="file" accept=".json,.yaml,.yml" onChange={async event => { const file = event.target.files[0]; if (file) await importValue(`file:${file.name}`, await file.text()); }} /></label>}
      {tab === 'Paste' && <CodeEditor label="Specification content" value={value} onChange={setValue} />}
      {tab === 'Examples' && <div className="example-list">{[['swagger.json', 'Sample API'], ['sample-specs/interactive-api.json', 'Interactive API'], ['sample-specs/test-security-swagger.json', 'Authentication schemes']].map(([url, name]) => <button key={url} disabled={busy} onClick={() => importValue(url)}><FileCode2 size={20} />{name}</button>)}</div>}
      {['URL', 'Paste'].includes(tab) && <button className="primary" disabled={busy || !value.trim()} onClick={() => importValue(tab === 'URL' ? value.trim() : 'pasted-spec', tab === 'Paste' ? value : undefined)}><Upload size={16} />{busy ? 'Importing...' : 'Import'}</button>}
    </div></Modal>;
}

export function CodeTools({ spec, operation, draft, server, variables, credentials, notify }) {
  const [mode, setMode] = useState(operation ? 'Request snippet' : 'API client');
  const [language, setLanguage] = useState('javascript');
  const [options, setOptions] = useState({});
  const [name, setName] = useState('ApiClient');
  const [namespace, setNamespace] = useState('ApiClient');
  const [file, setFile] = useState('client');
  const snippetGenerator = new CodeSnippetGenerator();
  const Generator = language === 'csharp' ? CSharpApiGenerator : JavaScriptApiGenerator;
  const generator = new Generator(options[language]);
  let files = {};
  let error = '';
  try {
    if (mode === 'Request snippet' && operation) {
      const request = buildRequest(operation, draft, server, variables, credentials, spec);
      const body = request.options.body instanceof URLSearchParams ? request.options.body.toString() : typeof request.options.body === 'string' ? request.options.body : '';
      files.snippet = snippetGenerator.generateSnippet(language, operation.method, request.url, body, Object.fromEntries(request.options.headers));
    } else {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || !/^[A-Za-z_][A-Za-z0-9_.]*$/.test(namespace)) throw new Error('Use valid identifiers for client and namespace names.');
      generator.loadFromSwaggerData(spec);
      files = generator.generateClient(namespace, name);
    }
  } catch (failure) { error = failure.message; }
  const selected = files[file] ? file : Object.keys(files).find(key => files[key]);
  const code = files[selected] || '';
  const languages = mode === 'API client' ? [{ id: 'javascript', name: 'JavaScript / TypeScript' }, { id: 'csharp', name: 'C#' }] : snippetGenerator.getSupportedLanguages();
  return <section className="tool-view code-tools"><header className="section-heading"><h1>Code</h1><div className="actions"><CopyButton value={code} notify={notify} /><IconButton label="Download code" disabled={!code} onClick={() => downloadBlob(new Blob([code], { type: 'text/plain' }), `${selected}.${language === 'csharp' ? 'cs' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'curl' ? 'sh' : options.javascript?.generateTypeScript ? 'ts' : 'js'}`)}><Download size={17} /></IconButton></div></header>
    <div className="subtabs" role="tablist" aria-label="Code generation">{['Request snippet', 'API client'].map(value => <button role="tab" aria-selected={mode === value} disabled={value === 'Request snippet' && !operation} key={value} onClick={() => { setMode(value); setLanguage('javascript'); }}>{value}</button>)}</div>
    <div className="code-options"><label>Language<select aria-label="Language" value={language} onChange={event => setLanguage(event.target.value)}>{languages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{mode === 'API client' && <><label>Class name<input value={name} onChange={event => setName(event.target.value)} /></label><label>Namespace / module<input value={namespace} onChange={event => setNamespace(event.target.value)} /></label></>}</div>
    {mode === 'API client' && <details><summary>Generator options</summary><div className="generator-options">{Object.entries(generator.options).map(([key, value]) => <label className="check-label" key={key}>{typeof value === 'boolean' ? <input type="checkbox" checked={value} onChange={event => setOptions(previous => ({ ...previous, [language]: { ...previous[language], [key]: event.target.checked } }))} /> : <select value={value} onChange={event => setOptions(previous => ({ ...previous, [language]: { ...previous[language], [key]: event.target.value } }))}><option>fetch</option><option>axios</option></select>}{key.replace(/([A-Z])/g, ' $1')}</label>)}</div></details>}
    {error ? <p role="alert" className="error-banner">{error}</p> : <><div className="subtabs" role="tablist" aria-label="Generated files">{Object.keys(files).filter(key => files[key]).map(key => <button role="tab" aria-selected={selected === key} key={key} onClick={() => setFile(key)}>{key}</button>)}</div><CodeEditor label="Generated code" value={code} readOnly language={language === 'curl' ? 'shell' : language} /></>}
  </section>;
}
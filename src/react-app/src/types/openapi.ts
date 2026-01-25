// OpenAPI Specification Types

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, PathItem>;
  components?: OpenAPIComponents;
  security?: SecurityRequirement[];
  tags?: OpenAPITag[];
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocs;
}

export interface ExternalDocs {
  description?: string;
  url: string;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  options?: Operation;
  head?: Operation;
  trace?: Operation;
  parameters?: Parameter[];
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody | Reference;
  responses: Record<string, Response | Reference>;
  security?: SecurityRequirement[];
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema: Schema;
  example?: unknown;
  examples?: Record<string, Example>;
}

export interface RequestBody {
  description?: string;
  content: Record<string, MediaType>;
  required?: boolean;
}

export interface Response {
  description: string;
  headers?: Record<string, Header | Reference>;
  content?: Record<string, MediaType>;
}

export interface MediaType {
  schema?: Schema | Reference;
  example?: unknown;
  examples?: Record<string, Example>;
}

export interface Schema {
  type?: string;
  format?: string;
  items?: Schema | Reference;
  properties?: Record<string, Schema | Reference>;
  additionalProperties?: boolean | Schema | Reference;
  required?: string[];
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
  description?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  allOf?: (Schema | Reference)[];
  oneOf?: (Schema | Reference)[];
  anyOf?: (Schema | Reference)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  $ref?: string;
}

export interface Reference {
  $ref: string;
}

export interface Example {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

export interface Header {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema: Schema;
}

export interface OpenAPIComponents {
  schemas?: Record<string, Schema>;
  responses?: Record<string, Response | Reference>;
  parameters?: Record<string, Parameter | Reference>;
  examples?: Record<string, Example | Reference>;
  requestBodies?: Record<string, RequestBody | Reference>;
  headers?: Record<string, Header | Reference>;
  securitySchemes?: Record<string, SecurityScheme>;
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows;
  openIdConnectUrl?: string;
}

export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface SecurityRequirement {
  [name: string]: string[];
}

// Helper types
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace';

export interface EndpointInfo {
  path: string;
  method: HttpMethod;
  operation: Operation;
  tag: string;
}

export interface FavoriteEndpoint {
  path: string;
  method: string;
  summary?: string;
}

export interface Variable {
  name: string;
  value: string;
}

export interface CollectionRequest {
  id: string;
  name: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  enabled: boolean;
  outputParameters?: OutputParameter[];
}

export interface OutputParameter {
  name: string;
  jsonPath: string;
}

export interface CollectionResult {
  request: CollectionRequest;
  response: {
    status: number | string;
    statusText: string;
    headers: Record<string, string>;
    body: unknown;
  };
  error?: string;
  duration: number;
  timestamp: string;
}

export interface SavedCollection {
  name: string;
  requests: CollectionRequest[];
  delay: number;
  updatedAt: string;
}

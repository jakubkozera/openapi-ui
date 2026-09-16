export type OpenApiDocument = Record<string, any>;

export interface Operation extends Record<string, any> {
  id: string;
  method: string;
  path: string;
  parameters: Record<string, any>[];
  security: Record<string, string[]>[];
}

export interface KeyValueRow extends Record<string, any> {
  name: string;
  value?: string;
  path?: string;
  location?: string;
  enabled?: boolean;
  required?: boolean;
  file?: boolean;
}

export type Draft = Record<string, any>;
export type Variables = KeyValueRow[];
export type Credentials = Record<string, Record<string, any>>;
export type Notify = (message: string, failure?: boolean) => void;

export interface ResponseData extends Record<string, any> {
  ok: boolean;
  status: number;
  statusText?: string;
  body?: string;
  headers?: Record<string, string>;
  duration?: number;
  size?: number;
  blob?: Blob;
}

export interface SavedRequest {
  collectionId: string;
  requestId: string;
  operationId?: string;
}

export interface CollectionRequest {
  id: string;
  operationId: string;
  draft: Draft;
  enabled?: boolean;
}

export interface RequestCollection {
  id: string;
  name: string;
  requests: CollectionRequest[];
  delay?: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface OpenAPISource {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
}

export interface OpenAPISourceStorage {
  sources: OpenAPISource[];
}

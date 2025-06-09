export interface OpenAPISource {
  id: string;
  name: string;
  type: "url" | "json";
  url?: string;
  content?: string;
  createdAt: Date;
}

export interface OpenAPISourceStorage {
  sources: OpenAPISource[];
}

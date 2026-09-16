export {};

declare global {
  interface Window {
    openapiHost?: {
      storage: Record<string, string>;
      save: (key: string, value: string | null) => void;
    };
  }
}

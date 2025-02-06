export interface VectorData {
  id: string;
  content: string;
  embedding: number[];
}

export interface SearchResult {
  id: string;
  content: string;
  score?: number;
}

export interface VectorSearchOptions {
  topK?: number;
  minScore?: number;
  filter?: string;
} 
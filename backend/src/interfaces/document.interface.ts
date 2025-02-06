export type DocumentType = 'script' | 'rule' | 'note';
export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface IDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  tags: string[];
  status: DocumentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface IDocumentCreate {
  title: string;
  content: string;
  type: DocumentType;
  tags?: string[];
  status?: DocumentStatus;
}

export interface IDocumentUpdate {
  title?: string;
  content?: string;
  type?: DocumentType;
  tags?: string[];
  status?: DocumentStatus;
}

export interface IDocumentQuery {
  page?: number;
  limit?: number;
  type?: DocumentType;
  status?: DocumentStatus;
  tags?: string[];
  search?: string;
}

export interface IDocumentVersion {
  version: number;
  title: string;
  changes: IDocumentChange[];
  createdAt: Date;
  createdBy: string;
}

export interface IDocumentChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface IDocumentListResponse {
  items: IDocument[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IDocumentVersionListResponse {
  items: IDocumentVersion[];
  total: number;
  page: number;
  limit: number;
  pages: number;
} 
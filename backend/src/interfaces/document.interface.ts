import { Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  type: string;
  tags: string[];
  version: number;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentVersion extends Document {
  documentId: string;
  version: number;
  title: string;
  content: string;
  changes: Array<{
    type: string;
    path: string;
    before?: any;
    after?: any;
  }>;
  comment?: string;
  createdBy: string;
  createdAt: Date;
}

export interface IDocumentCollaborator extends Document {
  documentId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  addedBy: string;
  addedAt: Date;
}

export type DocumentType = 'script' | 'rule' | 'note';
export type DocumentStatus = 'draft' | 'published' | 'archived';

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

export interface IDocumentVersionListResponse {
  items: IDocumentVersion[];
  total: number;
  page: number;
  limit: number;
  pages: number;
} 
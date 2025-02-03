import { Types } from 'mongoose';

export interface CreateTimelineEventDto {
  title: string;
  description: string;
  date: Date;
  characters: string[];
  location?: string;
  importance?: number;
  tags?: string[];
  relatedEvents?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTimelineEventDto {
  title?: string;
  description?: string;
  date?: Date;
  characters?: string[];
  location?: string;
  importance?: number;
  tags?: string[];
  relatedEvents?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface TimelineEventQueryDto {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
  characters?: string[];
  tags?: string[];
  importance?: number;
  search?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineEventResponseDto {
  id: string;
  title: string;
  description: string;
  date: Date;
  characters: Array<{
    id: string;
    name: string;
  }>;
  location?: string;
  importance: number;
  tags?: string[];
  relatedEvents?: Array<{
    id: string;
    title: string;
  }>;
  creator: {
    id: string;
    username: string;
  };
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 
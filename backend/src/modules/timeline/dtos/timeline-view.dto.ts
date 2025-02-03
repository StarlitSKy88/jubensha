import { Types } from 'mongoose';

export interface TimelineViewFilters {
  startDate?: Date;
  endDate?: Date;
  characters?: Types.ObjectId[];
  tags?: string[];
  eventTypes?: string[];
}

export interface TimelineViewDisplay {
  groupBy: 'character' | 'date' | 'type';
  sortBy: 'date' | 'importance';
  sortOrder: 'asc' | 'desc';
  showDetails: boolean;
  colorScheme: string;
}

export interface TimelineViewLayout {
  type: 'vertical' | 'horizontal';
  scale: 'linear' | 'logarithmic';
  density: 'compact' | 'comfortable';
  showLabels: boolean;
  showConnections: boolean;
}

export interface CreateTimelineViewDto {
  name: string;
  description?: string;
  filters?: TimelineViewFilters;
  display?: Partial<TimelineViewDisplay>;
  layout?: Partial<TimelineViewLayout>;
}

export interface UpdateTimelineViewDto {
  name?: string;
  description?: string;
  filters?: Partial<TimelineViewFilters>;
  display?: Partial<TimelineViewDisplay>;
  layout?: Partial<TimelineViewLayout>;
}

export interface TimelineViewQueryDto {
  projectId: Types.ObjectId;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineEventNode {
  id: Types.ObjectId;
  title: string;
  date: Date;
  type: string;
  importance: number;
  characters: {
    id: Types.ObjectId;
    name: string;
    role: string;
  }[];
  tags: string[];
  description?: string;
  location?: string;
}

export interface TimelineConnection {
  source: Types.ObjectId;
  target: Types.ObjectId;
  type: string;
  description?: string;
}

export interface TimelineVisualizationData {
  nodes: TimelineEventNode[];
  connections: TimelineConnection[];
  metadata: {
    totalEvents: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    characterCount: number;
    eventTypeStats: {
      [key: string]: number;
    };
  };
}

export interface TimelineViewResponse {
  id: Types.ObjectId;
  name: string;
  description?: string;
  filters: TimelineViewFilters;
  display: TimelineViewDisplay;
  layout: TimelineViewLayout;
  eventCount: number;
  createdAt: Date;
  updatedAt: Date;
  visualization?: TimelineVisualizationData;
} 
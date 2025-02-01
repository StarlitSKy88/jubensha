import request from './request';

export interface Project {
  id: string;
  title: string;
  description: string;
  cover?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectParams {
  title: string;
  description: string;
  cover?: string;
}

export interface UpdateProjectParams extends Partial<CreateProjectParams> {
  id: string;
}

export const getProjects = (params?: {
  page?: number;
  pageSize?: number;
  status?: Project['status'];
}) => {
  return request.get<{
    items: Project[];
    total: number;
  }>('/api/projects', { params });
};

export const getProjectById = (id: string) => {
  return request.get<Project>(`/api/projects/${id}`);
};

export const createProject = (data: CreateProjectParams) => {
  return request.post<Project>('/api/projects', data);
};

export const updateProject = (data: UpdateProjectParams) => {
  return request.put<Project>(`/api/projects/${data.id}`, data);
};

export const deleteProject = (id: string) => {
  return request.delete(`/api/projects/${id}`);
};

// 导入导出
export const exportProject = (id: string, format: 'pdf' | 'docx' = 'pdf') => {
  return request.get(`/api/projects/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
};

export const importProject = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<Project>('/api/projects/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 
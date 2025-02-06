import { z } from 'zod';

export const documentValidation = {
  createDocument: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    type: z.string(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  updateDocument: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  getDocuments: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  })
}; 
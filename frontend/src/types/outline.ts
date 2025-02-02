export interface TreeNode {
  id: string
  title: string
  type: 'chapter' | 'section' | 'scene'
  summary: string
  notes?: string
  wordCount: number
  children?: TreeNode[]
  isEditing?: boolean
  createdAt: string
  updatedAt: string
}

export interface ChapterData {
  title: string
  type: TreeNode['type']
  summary: string
  notes?: string
  parentId?: string
}

export interface ChapterOrderData {
  id: string
  targetId: string
  position: 'prev' | 'next' | 'inner'
} 
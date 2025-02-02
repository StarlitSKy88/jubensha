<template>
  <div class="outline-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button 
          type="primary" 
          :icon="Plus"
          @click="handleAddChapter"
        >
          添加章节
        </el-button>
        <el-button 
          type="success" 
          :icon="Sort"
          @click="handleReorder"
        >
          重新排序
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button 
          :icon="Expand"
          @click="expandAll"
        >
          展开全部
        </el-button>
        <el-button 
          :icon="Fold"
          @click="collapseAll"
        >
          折叠全部
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button 
          type="primary" 
          :icon="Download"
          @click="handleExport"
        >
          导出大纲
        </el-button>
        <el-button 
          type="success" 
          :icon="Upload"
          @click="handleImport"
        >
          导入大纲
        </el-button>
      </el-button-group>
    </div>

    <!-- 大纲树 -->
    <el-tree
      ref="treeRef"
      :data="outlineData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      draggable
      :allow-drop="handleAllowDrop"
      :allow-drag="handleAllowDrag"
      @node-drag-end="handleDragEnd"
    >
      <template #default="{ node, data }">
        <div class="outline-node">
          <!-- 节点内容 -->
          <div class="node-content">
            <el-input
              v-if="data.isEditing"
              v-model="data.title"
              size="small"
              @blur="handleTitleBlur(data)"
              @keyup.enter="handleTitleBlur(data)"
            />
            <span v-else class="title" @dblclick="handleTitleDblClick(data)">
              {{ data.title }}
            </span>
            
            <div class="node-meta">
              <el-tag size="small" :type="getChapterType(data.type)">
                {{ getChapterTypeText(data.type) }}
              </el-tag>
              <span class="word-count">{{ data.wordCount }}字</span>
            </div>
          </div>

          <!-- 节点操作 -->
          <div class="node-actions">
            <el-button-group>
              <el-button 
                link 
                type="primary" 
                :icon="Plus"
                @click="handleAddSubChapter(data)"
              >
                添加子章节
              </el-button>
              <el-button 
                link 
                type="primary" 
                :icon="Edit"
                @click="handleEditChapter(data)"
              >
                编辑
              </el-button>
              <el-button 
                link 
                type="danger" 
                :icon="Delete"
                @click="handleDeleteChapter(node, data)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 章节编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '添加章节' : '编辑章节'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="章" value="chapter" />
            <el-option label="节" value="section" />
            <el-option label="场景" value="scene" />
          </el-select>
        </el-form-item>

        <el-form-item label="概要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importVisible"
      title="导入大纲"
      width="400px"
    >
      <el-upload
        class="upload-demo"
        drag
        action="/api/outline/import"
        :on-success="handleImportSuccess"
        :before-upload="beforeImport"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .txt, .md, .docx 格式文件
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete, 
  Download, 
  Upload, 
  Sort,
  Expand,
  Fold,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { TreeNode } from '@/types/outline'

// 状态
const outlineData = ref<TreeNode[]>([])
const dialogVisible = ref(false)
const importVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const currentNode = ref<TreeNode | null>(null)

// 表单
const formRef = ref<FormInstance>()
const form = ref({
  title: '',
  type: 'chapter',
  summary: '',
  notes: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  summary: [
    { required: true, message: '请输入概要', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 树配置
const defaultProps = {
  children: 'children',
  label: 'title'
}

// 加载大纲数据
const loadOutline = async () => {
  try {
    const data = await getOutline()
    outlineData.value = data
  } catch (error) {
    ElMessage.error('加载大纲失败')
  }
}

// 添加章节
const handleAddChapter = () => {
  dialogType.value = 'create'
  currentNode.value = null
  form.value = {
    title: '',
    type: 'chapter',
    summary: '',
    notes: ''
  }
  dialogVisible.value = true
}

// 添加子章节
const handleAddSubChapter = (data: TreeNode) => {
  dialogType.value = 'create'
  currentNode.value = data
  form.value = {
    title: '',
    type: data.type === 'chapter' ? 'section' : 'scene',
    summary: '',
    notes: ''
  }
  dialogVisible.value = true
}

// 编辑章节
const handleEditChapter = (data: TreeNode) => {
  dialogType.value = 'edit'
  currentNode.value = data
  form.value = {
    title: data.title,
    type: data.type,
    summary: data.summary,
    notes: data.notes || ''
  }
  dialogVisible.value = true
}

// 删除章节
const handleDeleteChapter = async (node: any, data: TreeNode) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该章节吗？子章节也会被删除。',
      '删除确认',
      {
        type: 'warning'
      }
    )
    await deleteChapter(data.id)
    const parent = node.parent
    const children = parent.data.children || parent.data
    const index = children.findIndex((d: TreeNode) => d.id === data.id)
    children.splice(index, 1)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'create') {
          const newNode = await createChapter({
            ...form.value,
            parentId: currentNode.value?.id
          })
          if (currentNode.value) {
            if (!currentNode.value.children) {
              currentNode.value.children = []
            }
            currentNode.value.children.push(newNode)
          } else {
            outlineData.value.push(newNode)
          }
          ElMessage.success('创建成功')
        } else {
          if (!currentNode.value) return
          await updateChapter({
            id: currentNode.value.id,
            ...form.value
          })
          Object.assign(currentNode.value, form.value)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      }
    }
  })
}

// 标题编辑
const handleTitleDblClick = (data: TreeNode) => {
  data.isEditing = true
}

const handleTitleBlur = async (data: TreeNode) => {
  data.isEditing = false
  try {
    await updateChapter({
      id: data.id,
      title: data.title
    })
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 拖拽相关
const handleAllowDrop = (draggingNode: any, dropNode: any, type: 'prev' | 'next' | 'inner') => {
  // 不允许将章节拖到场景下
  if (dropNode.data.type === 'scene' && type === 'inner') {
    return false
  }
  // 不允许将章拖到节下
  if (draggingNode.data.type === 'chapter' && dropNode.data.type === 'section') {
    return false
  }
  return true
}

const handleAllowDrag = (node: any) => {
  return true
}

const handleDragEnd = async (draggingNode: any, dropNode: any, dropType: 'prev' | 'next' | 'inner') => {
  try {
    await updateChapterOrder({
      id: draggingNode.data.id,
      targetId: dropNode.data.id,
      position: dropType
    })
    ElMessage.success('移动成功')
  } catch (error) {
    ElMessage.error('移动失败')
    // 重新加载以恢复原始顺序
    loadOutline()
  }
}

// 展开/折叠
const treeRef = ref()
const expandAll = () => {
  treeRef.value?.expandAll()
}

const collapseAll = () => {
  treeRef.value?.collapseAll()
}

// 导入导出
const handleExport = () => {
  window.open('/api/outline/export', '_blank')
}

const beforeImport = (file: File) => {
  const validTypes = ['text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 .txt, .md, .docx 格式文件')
    return false
  }
  return true
}

const handleImportSuccess = (response: any) => {
  ElMessage.success('导入成功')
  importVisible.value = false
  loadOutline()
}

// 工具函数
const getChapterType = (type: string): '' | 'success' | 'warning' => {
  const typeMap: Record<string, '' | 'success' | 'warning'> = {
    chapter: '',
    section: 'success',
    scene: 'warning'
  }
  return typeMap[type] || ''
}

const getChapterTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    chapter: '章',
    section: '节',
    scene: '场景'
  }
  return textMap[type] || type
}

// 初始化
onMounted(() => {
  loadOutline()
})
</script>

<style scoped lang="scss">
.outline-editor {
  padding: 20px;

  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .outline-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .node-content {
      display: flex;
      align-items: center;
      gap: 10px;

      .title {
        cursor: pointer;
        &:hover {
          color: var(--el-color-primary);
        }
      }

      .node-meta {
        display: flex;
        align-items: center;
        gap: 10px;

        .word-count {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .node-actions {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .node-actions {
      opacity: 1;
    }
  }

  :deep(.el-tree-node__content) {
    height: 40px;
  }

  :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
    background-color: var(--el-color-primary-light-9);
  }
}
</style> 
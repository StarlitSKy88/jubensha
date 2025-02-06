<template>
  <div class="plot-editor">
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" @click="addChapter">
          <el-icon><Plus /></el-icon>
          添加章节
        </el-button>
        <el-button @click="previewPlot">
          <el-icon><View /></el-icon>
          预览
        </el-button>
      </el-button-group>
      <el-button-group>
        <el-button @click="expandAll">展开全部</el-button>
        <el-button @click="collapseAll">收起全部</el-button>
      </el-button-group>
    </div>

    <div class="plot-content">
      <el-tree
        ref="plotTreeRef"
        :data="plotData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        draggable
        @node-drag-start="handleDragStart"
        @node-drag-end="handleDragEnd"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="node-content">
              <span
                class="node-type"
                :class="data.type"
              >
                {{ getNodeTypeLabel(data.type) }}
              </span>
              <span
                v-if="!data.isEditing"
                class="node-title"
                @dblclick="startEditing(node, data)"
              >
                {{ data.title }}
              </span>
              <el-input
                v-else
                v-model="data.title"
                size="small"
                @blur="finishEditing(node, data)"
                @keyup.enter="finishEditing(node, data)"
              />
            </div>
            <div class="node-actions">
              <el-button-group>
                <el-button
                  size="small"
                  @click="editNode(node, data)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  @click="addChild(node, data)"
                >
                  添加子节点
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="removeNode(node, data)"
                >
                  删除
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 节点编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="70%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="nodeFormRef"
        :model="nodeForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="nodeForm.title" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="nodeForm.type">
            <el-option
              v-for="type in nodeTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="nodeForm.content"
            type="textarea"
            :rows="6"
          />
        </el-form-item>

        <el-form-item label="关联角色" prop="characters">
          <el-select
            v-model="nodeForm.characters"
            multiple
            filterable
          >
            <el-option
              v-for="char in characters"
              :key="char.id"
              :label="char.name"
              :value="char.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关联线索" prop="clues">
          <el-select
            v-model="nodeForm.clues"
            multiple
            filterable
            allow-create
          >
            <el-option
              v-for="clue in clues"
              :key="clue.id"
              :label="clue.name"
              :value="clue.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间点" prop="timestamp">
          <el-time-picker
            v-model="nodeForm.timestamp"
            format="HH:mm"
            placeholder="选择时间点"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="nodeForm.notes"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="saveNode">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="剧情预览"
      width="80%"
      fullscreen
    >
      <div class="plot-preview">
        <div
          v-for="chapter in plotData"
          :key="chapter.id"
          class="preview-chapter"
        >
          <h2>{{ chapter.title }}</h2>
          <div
            v-for="scene in chapter.children"
            :key="scene.id"
            class="preview-scene"
          >
            <h3>{{ scene.title }}</h3>
            <div class="scene-meta">
              <span class="scene-time">{{ formatTime(scene.timestamp) }}</span>
              <span class="scene-characters">
                参与角色：{{ getCharacterNames(scene.characters) }}
              </span>
            </div>
            <div class="scene-content">{{ scene.content }}</div>
            <div v-if="scene.clues?.length" class="scene-clues">
              <h4>相关线索：</h4>
              <el-tag
                v-for="clue in scene.clues"
                :key="clue"
                size="small"
                class="clue-tag"
              >
                {{ getClueLabel(clue) }}
              </el-tag>
            </div>
            <div v-if="scene.notes" class="scene-notes">
              <h4>备注：</h4>
              <p>{{ scene.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, View } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree/src/tree.type'

const props = defineProps<{
  scriptId: string
}>()

// 状态
const plotTreeRef = ref()
const dialogVisible = ref(false)
const previewDialogVisible = ref(false)
const nodeFormRef = ref<FormInstance>()
const currentNode = ref<TreeNode | null>(null)

// 表单数据
const nodeForm = ref({
  id: '',
  title: '',
  type: '',
  content: '',
  characters: [],
  clues: [],
  timestamp: null,
  notes: ''
})

// 节点类型
const nodeTypes = [
  { label: '章节', value: 'chapter' },
  { label: '场景', value: 'scene' },
  { label: '事件', value: 'event' }
]

// 树形配置
const defaultProps = {
  children: 'children',
  label: 'title'
}

// 模拟数据
const plotData = ref([
  {
    id: '1',
    title: '第一章：序章',
    type: 'chapter',
    children: [
      {
        id: '1-1',
        title: '开场',
        type: 'scene',
        content: '玩家们陆续到达别墅...',
        characters: ['1', '2'],
        timestamp: '19:30',
        notes: '注意营造紧张氛围'
      }
    ]
  }
])

const characters = ref([
  { id: '1', name: '张三' },
  { id: '2', name: '李四' }
])

const clues = ref([
  { id: '1', name: '染血的信' },
  { id: '2', name: '神秘钥匙' }
])

// 计算属性
const dialogTitle = computed(() => {
  return nodeForm.value.id ? '编辑节点' : '新建节点'
})

// 表单验证规则
const formRules = ref<FormRules>({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ]
})

// 方法
const getNodeTypeLabel = (type: string) => {
  return nodeTypes.find(t => t.value === type)?.label || type
}

const addChapter = () => {
  nodeForm.value = {
    id: '',
    title: '',
    type: 'chapter',
    content: '',
    characters: [],
    clues: [],
    timestamp: null,
    notes: ''
  }
  dialogVisible.value = true
}

const editNode = (node: TreeNode, data: any) => {
  currentNode.value = node
  nodeForm.value = { ...data }
  dialogVisible.value = true
}

const addChild = (node: TreeNode, data: any) => {
  currentNode.value = node
  nodeForm.value = {
    id: '',
    title: '',
    type: data.type === 'chapter' ? 'scene' : 'event',
    content: '',
    characters: [],
    clues: [],
    timestamp: null,
    notes: ''
  }
  dialogVisible.value = true
}

const removeNode = async (node: TreeNode, data: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该节点吗？如果是章节，将同时删除其下所有场景。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // TODO: 实现删除逻辑
  } catch {
    // 用户取消删除
  }
}

const startEditing = (node: TreeNode, data: any) => {
  data.isEditing = true
}

const finishEditing = (node: TreeNode, data: any) => {
  data.isEditing = false
  // TODO: 保存更改
}

const handleDialogClose = () => {
  dialogVisible.value = false
  if (nodeFormRef.value) {
    nodeFormRef.value.resetFields()
  }
}

const saveNode = async () => {
  if (!nodeFormRef.value) return

  await nodeFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // TODO: 保存节点
      dialogVisible.value = false
    }
  })
}

const handleDragStart = (node: TreeNode, ev: DragEvent) => {
  // TODO: 处理拖拽开始
}

const handleDragEnd = (node: TreeNode, ev: DragEvent) => {
  // TODO: 处理拖拽结束
}

const expandAll = () => {
  plotTreeRef.value?.expandAll()
}

const collapseAll = () => {
  plotTreeRef.value?.collapseAll()
}

const previewPlot = () => {
  previewDialogVisible.value = true
}

const formatTime = (time: string) => {
  return time || '--'
}

const getCharacterNames = (characterIds: string[]) => {
  return characterIds
    .map(id => characters.value.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join('、') || '无'
}

const getClueLabel = (clueId: string) => {
  return clues.value.find(c => c.id === clueId)?.name || clueId
}
</script>

<style scoped>
.plot-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 16px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #dcdfe6;
}

.plot-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.node-type.chapter {
  background-color: #f0f9eb;
  color: #67c23a;
}

.node-type.scene {
  background-color: #f4f4f5;
  color: #909399;
}

.node-type.event {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.node-title {
  font-size: 14px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
}

.plot-preview {
  padding: 20px;
}

.preview-chapter {
  margin-bottom: 40px;
}

.preview-chapter h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.preview-scene {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-scene h3 {
  margin-bottom: 16px;
}

.scene-meta {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.scene-time {
  margin-right: 20px;
}

.scene-content {
  margin-bottom: 16px;
  line-height: 1.6;
}

.scene-clues {
  margin-bottom: 16px;
}

.scene-clues h4,
.scene-notes h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.clue-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.scene-notes {
  font-size: 14px;
  color: #606266;
  font-style: italic;
}
</style> 
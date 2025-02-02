<template>
  <div class="clue-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button 
          type="primary" 
          :icon="Plus"
          @click="handleCreate"
        >
          添加线索
        </el-button>
        <el-button 
          type="success" 
          :icon="Connection"
          @click="handleShowNetwork"
        >
          线索网络
        </el-button>
        <el-button 
          type="warning" 
          :icon="Warning"
          @click="handleCheckConsistency"
        >
          一致性检查
        </el-button>
      </el-button-group>

      <div class="filters">
        <el-select v-model="typeFilter" clearable placeholder="线索类型">
          <el-option label="物品" value="object" />
          <el-option label="信息" value="information" />
          <el-option label="事件" value="event" />
          <el-option label="地点" value="location" />
          <el-option label="关系" value="relationship" />
        </el-select>

        <el-select v-model="statusFilter" clearable placeholder="线索状态">
          <el-option label="活跃" value="active" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已放弃" value="abandoned" />
        </el-select>

        <el-select 
          v-model="importanceFilter" 
          clearable 
          placeholder="重要程度"
        >
          <el-option 
            v-for="n in 5" 
            :key="n" 
            :label="'⭐'.repeat(n)" 
            :value="n" 
          />
        </el-select>
      </div>

      <el-input
        v-model="searchQuery"
        placeholder="搜索线索"
        class="search-input"
        clearable
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 线索列表 -->
    <el-table
      :data="filteredClues"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <div class="clue-title">
            <span>{{ row.title }}</span>
            <el-tag 
              size="small" 
              :type="getStatusType(row.status)"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeType(row.type)">
            {{ getTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="importance" label="重要程度" width="120">
        <template #default="{ row }">
          <el-rate
            v-model="row.importance"
            disabled
            text-color="#ff9900"
          />
        </template>
      </el-table-column>

      <el-table-column prop="relatedCharacters" label="相关角色" min-width="150">
        <template #default="{ row }">
          <el-tag
            v-for="character in row.relatedCharacters"
            :key="character"
            size="small"
            effect="plain"
            class="character-tag"
          >
            {{ character }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="tags" label="标签" min-width="150">
        <template #default="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
            class="tag"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button 
              link 
              type="primary" 
              :icon="Edit"
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              link 
              type="danger" 
              :icon="Delete"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 线索编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '添加线索' : '编辑线索'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="物品" value="object" />
            <el-option label="信息" value="information" />
            <el-option label="事件" value="event" />
            <el-option label="地点" value="location" />
            <el-option label="关系" value="relationship" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="重要程度" prop="importance">
          <el-rate
            v-model="form.importance"
            :texts="['不重要', '次要', '普通', '重要', '关键']"
            show-text
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="活跃" value="active" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已放弃" value="abandoned" />
          </el-select>
        </el-form-item>

        <el-form-item label="相关角色">
          <el-select
            v-model="form.relatedCharacters"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入相关角色"
          >
            <el-option
              v-for="character in characters"
              :key="character"
              :label="character"
              :value="character"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="相关场景">
          <el-select
            v-model="form.relatedScenes"
            multiple
            filterable
            placeholder="请选择相关场景"
          >
            <el-option
              v-for="scene in scenes"
              :key="scene.id"
              :label="scene.title"
              :value="scene.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="handleRemoveTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleAddTag"
            @blur="handleAddTag"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
            + 添加标签
          </el-button>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 线索网络对话框 -->
    <el-dialog
      v-model="networkVisible"
      title="线索网络"
      fullscreen
    >
      <div class="network-container">
        <!-- 网络图谱 -->
        <div class="network-graph">
          <!-- 这里使用图谱组件 -->
        </div>

        <!-- 分析结果 -->
        <div class="network-analysis">
          <el-tabs>
            <el-tab-pane label="聚类分析">
              <div v-for="cluster in networkAnalysis.clusters" :key="cluster.theme">
                <h4>{{ cluster.theme }}</h4>
                <p>强度: {{ cluster.strength }}</p>
                <div class="cluster-clues">
                  <el-tag
                    v-for="clueId in cluster.clues"
                    :key="clueId"
                    size="small"
                    class="cluster-clue"
                  >
                    {{ getClueTitle(clueId) }}
                  </el-tag>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="建议">
              <el-timeline>
                <el-timeline-item
                  v-for="(suggestion, index) in networkAnalysis.suggestions"
                  :key="index"
                  :type="getTimelineItemType(index)"
                >
                  {{ suggestion }}
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-dialog>

    <!-- 一致性检查对话框 -->
    <el-dialog
      v-model="consistencyVisible"
      title="线索一致性检查"
      width="800px"
    >
      <div class="consistency-result">
        <div class="score">
          <el-progress
            type="dashboard"
            :percentage="consistencyResult.score"
            :color="getScoreColor"
          />
          <span class="score-label">一致性得分</span>
        </div>

        <div class="issues">
          <el-collapse>
            <el-collapse-item
              v-for="(issue, index) in consistencyResult.issues"
              :key="index"
              :title="getIssueTitle(issue)"
            >
              <p class="issue-description">{{ issue.description }}</p>
              <div class="issue-clues">
                <el-tag
                  v-for="clueId in issue.clues"
                  :key="clueId"
                  size="small"
                  :type="getIssueType(issue.type)"
                  effect="dark"
                >
                  {{ getClueTitle(clueId) }}
                </el-tag>
              </div>
              <p class="issue-suggestion">
                <el-icon><Lightbulb /></el-icon>
                {{ issue.suggestion }}
              </p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus,
  Edit,
  Delete,
  Search,
  Connection,
  Warning,
  Lightbulb
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Clue } from '@/services/clue.service'
import {
  getClues,
  createClue,
  updateClue,
  deleteClue,
  analyzeClueNetwork,
  checkClueConsistency
} from '@/services/clue.service'

// 状态
const clues = ref<Clue[]>([])
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const importanceFilter = ref<number | null>(null)
const dialogVisible = ref(false)
const networkVisible = ref(false)
const consistencyVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const currentClue = ref<Clue | null>(null)

// 模拟数据
const characters = ['张三', '李四', '王五']
const scenes = [
  { id: '1', title: '第一章 开头' },
  { id: '2', title: '第二章 发展' },
  { id: '3', title: '第三章 高潮' }
]

// 表单
const formRef = ref<FormInstance>()
const form = ref({
  title: '',
  type: 'information' as const,
  description: '',
  importance: 3,
  status: 'active' as const,
  relatedCharacters: [] as string[],
  relatedScenes: [] as string[],
  tags: [] as string[],
  notes: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入线索标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择线索类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入线索描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  importance: [
    { required: true, message: '请选择重要程度', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择线索状态', trigger: 'change' }
  ]
}

// 标签输入
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<HTMLInputElement>()

// 网络分析结果
const networkAnalysis = ref({
  clusters: [] as Array<{
    clues: string[]
    theme: string
    strength: number
  }>,
  suggestions: [] as string[]
})

// 一致性检查结果
const consistencyResult = ref({
  score: 0,
  issues: [] as Array<{
    type: 'contradiction' | 'gap' | 'redundancy'
    description: string
    clues: string[]
    suggestion: string
  }>
})

// 计算属性
const filteredClues = computed(() => {
  let result = clues.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(clue => 
      clue.title.toLowerCase().includes(query) ||
      clue.description.toLowerCase().includes(query) ||
      clue.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (typeFilter.value) {
    result = result.filter(clue => clue.type === typeFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(clue => clue.status === statusFilter.value)
  }

  if (importanceFilter.value) {
    result = result.filter(clue => clue.importance === importanceFilter.value)
  }

  return result
})

// 加载线索列表
const loadClues = async () => {
  try {
    const data = await getClues('project-id') // TODO: 从路由或状态获取项目ID
    clues.value = data
  } catch (error) {
    ElMessage.error('加载线索列表失败')
  }
}

// 创建线索
const handleCreate = () => {
  dialogType.value = 'create'
  form.value = {
    title: '',
    type: 'information',
    description: '',
    importance: 3,
    status: 'active',
    relatedCharacters: [],
    relatedScenes: [],
    tags: [],
    notes: ''
  }
  dialogVisible.value = true
}

// 编辑线索
const handleEdit = (clue: Clue) => {
  dialogType.value = 'edit'
  currentClue.value = clue
  form.value = {
    title: clue.title,
    type: clue.type,
    description: clue.description,
    importance: clue.importance,
    status: clue.status,
    relatedCharacters: [...clue.relatedCharacters],
    relatedScenes: [...clue.relatedScenes],
    tags: [...clue.tags],
    notes: clue.notes || ''
  }
  dialogVisible.value = true
}

// 删除线索
const handleDelete = async (clue: Clue) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该线索吗？相关的时间线和关联数据也会被删除。',
      '删除确认',
      {
        type: 'warning'
      }
    )
    await deleteClue(clue.id)
    const index = clues.value.findIndex(c => c.id === clue.id)
    clues.value.splice(index, 1)
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
          const newClue = await createClue({
            ...form.value,
            projectId: 'project-id' // TODO: 从路由或状态获取项目ID
          })
          clues.value.push(newClue)
          ElMessage.success('创建成功')
        } else {
          if (!currentClue.value) return
          await updateClue(currentClue.value.id, form.value)
          const index = clues.value.findIndex(c => c.id === currentClue.value!.id)
          clues.value[index] = { ...currentClue.value, ...form.value }
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      }
    }
  })
}

// 标签相关
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const handleAddTag = () => {
  if (tagInputValue.value) {
    form.value.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const handleRemoveTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  form.value.tags.splice(index, 1)
}

// 线索网络相关
const handleShowNetwork = async () => {
  try {
    const result = await analyzeClueNetwork('project-id') // TODO: 从路由或状态获取项目ID
    networkAnalysis.value = result
    networkVisible.value = true
  } catch (error) {
    ElMessage.error('分析线索网络失败')
  }
}

// 一致性检查相关
const handleCheckConsistency = async () => {
  try {
    const result = await checkClueConsistency('project-id') // TODO: 从路由或状态获取项目ID
    consistencyResult.value = result
    consistencyVisible.value = true
  } catch (error) {
    ElMessage.error('检查线索一致性失败')
  }
}

// 工具函数
const getTypeType = (type: string): '' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    object: '',
    information: 'info',
    event: 'warning',
    location: 'success',
    relationship: 'danger'
  }
  return typeMap[type] || ''
}

const getTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    object: '物品',
    information: '信息',
    event: '事件',
    location: '地点',
    relationship: '关系'
  }
  return textMap[type] || type
}

const getStatusType = (status: string): '' | 'success' | 'warning' | 'info' => {
  const statusMap: Record<string, '' | 'success' | 'warning' | 'info'> = {
    active: 'warning',
    resolved: 'success',
    abandoned: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    active: '活跃',
    resolved: '已解决',
    abandoned: '已放弃'
  }
  return textMap[status] || status
}

const getTimelineItemType = (index: number): '' | 'primary' | 'success' | 'warning' | 'danger' => {
  const types: Array<'' | 'primary' | 'success' | 'warning' | 'danger'> = [
    'primary', 'success', 'warning', 'danger'
  ]
  return types[index % types.length] || ''
}

const getIssueType = (type: string): '' | 'warning' | 'danger' => {
  const typeMap: Record<string, '' | 'warning' | 'danger'> = {
    contradiction: 'danger',
    gap: 'warning',
    redundancy: ''
  }
  return typeMap[type] || ''
}

const getIssueTitle = (issue: {
  type: string
  description: string
}): string => {
  const typeText = {
    contradiction: '矛盾',
    gap: '空缺',
    redundancy: '冗余'
  }[issue.type] || issue.type
  
  return `${typeText}: ${issue.description.slice(0, 20)}...`
}

const getClueTitle = (id: string): string => {
  const clue = clues.value.find(c => c.id === id)
  return clue?.title || id
}

const getScoreColor = (percentage: number) => {
  if (percentage < 60) return '#F56C6C'
  if (percentage < 80) return '#E6A23C'
  return '#67C23A'
}

// 初始化
onMounted(() => {
  loadClues()
})
</script>

<style scoped lang="scss">
.clue-manager {
  padding: 20px;

  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .filters {
      display: flex;
      gap: 10px;
    }

    .search-input {
      width: 300px;
    }
  }

  .clue-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .character-tag,
  .tag {
    margin-right: 5px;
  }

  .tag-input {
    width: 100px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .network-container {
    display: flex;
    gap: 20px;
    height: calc(100vh - 200px);

    .network-graph {
      flex: 1;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }

    .network-analysis {
      width: 400px;
      overflow-y: auto;

      .cluster-clues {
        margin: 10px 0;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
    }
  }

  .consistency-result {
    .score {
      text-align: center;
      margin-bottom: 30px;

      .score-label {
        display: block;
        margin-top: 10px;
        color: #666;
      }
    }

    .issues {
      .issue-description {
        color: #666;
        margin: 10px 0;
      }

      .issue-clues {
        margin: 10px 0;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .issue-suggestion {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #409eff;
        margin: 10px 0 0;
      }
    }
  }
}
</style>


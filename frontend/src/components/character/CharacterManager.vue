<template>
  <div class="character-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>添加角色
      </el-button>
      <el-button @click="showRelationshipGraph = true">
        <el-icon><Connection /></el-icon>关系图谱
      </el-button>
      <el-button @click="batchAnalyze">
        <el-icon><DataAnalysis /></el-icon>批量分析
      </el-button>
      <el-button-group>
        <el-button @click="exportCharacters">导出</el-button>
        <el-button @click="showImportDialog = true">导入</el-button>
      </el-button-group>
    </div>

    <!-- 过滤器 -->
    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索角色..."
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="selectedRole" placeholder="角色类型" clearable>
        <el-option
          v-for="role in roleOptions"
          :key="role.value"
          :label="role.label"
          :value="role.value"
        />
      </el-select>
    </div>

    <!-- 角色列表 -->
    <div class="character-list">
      <el-row :gutter="20">
        <el-col
          v-for="character in filteredCharacters"
          :key="character.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="character-card">
            <div class="character-header">
              <el-avatar 
                :size="100" 
                :src="character.avatar || '/default-avatar.jpg'"
              />
              <el-tag :type="getRoleType(character.role)" class="role-tag">
                {{ getRoleText(character.role) }}
              </el-tag>
            </div>

            <div class="character-info">
              <h3>{{ character.name }}</h3>
              <p class="archetype">{{ character.archetype }}</p>
              
              <div class="traits">
                <el-tag
                  v-for="trait in character.personality.traits"
                  :key="trait"
                  size="small"
                  class="trait-tag"
                >
                  {{ trait }}
                </el-tag>
              </div>

              <div class="analysis-scores" v-if="character.analysis">
                <div class="score-item">
                  <span class="label">深度</span>
                  <el-progress 
                    :percentage="character.analysis.depth.score" 
                    :color="getProgressColor"
                  />
                </div>
                <div class="score-item">
                  <span class="label">一致性</span>
                  <el-progress 
                    :percentage="character.analysis.consistency.score" 
                    :color="getProgressColor"
                  />
                </div>
                <div class="score-item">
                  <span class="label">发展</span>
                  <el-progress 
                    :percentage="character.analysis.development.score" 
                    :color="getProgressColor"
                  />
                </div>
              </div>
            </div>

            <div class="character-actions">
              <el-button-group>
                <el-button
                  size="small"
                  @click="editCharacter(character)"
                >编辑</el-button>
                <el-button
                  size="small"
                  @click="analyzeCharacter(character)"
                >分析</el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteCharacter(character)"
                >删除</el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'edit' ? '编辑角色' : '添加角色'"
      width="60%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="角色类型" prop="role">
              <el-select v-model="form.role" placeholder="选择角色类型">
                <el-option
                  v-for="role in roleOptions"
                  :key="role.value"
                  :label="role.label"
                  :value="role.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="原型" prop="archetype">
              <el-input v-model="form.archetype" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="性格特征" name="personality">
            <el-form-item label="性格特征">
              <div class="trait-input">
                <el-tag
                  v-for="trait in form.personality.traits"
                  :key="trait"
                  closable
                  @close="handleTraitClose(trait)"
                >
                  {{ trait }}
                </el-tag>
                <el-input
                  v-if="traitInputVisible"
                  ref="traitInputRef"
                  v-model="traitInputValue"
                  class="trait-input-box"
                  size="small"
                  @keyup.enter="handleTraitConfirm"
                  @blur="handleTraitConfirm"
                />
                <el-button
                  v-else
                  class="button-new-trait"
                  size="small"
                  @click="showTraitInput"
                >
                  + 添加特征
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="MBTI">
              <el-input v-model="form.personality.mbti" />
            </el-form-item>

            <el-form-item label="优点">
              <el-input
                v-model="form.personality.strengths"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="缺点">
              <el-input
                v-model="form.personality.weaknesses"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="背景设定" name="background">
            <el-form-item label="年龄">
              <el-input-number v-model="form.background.age" :min="0" />
            </el-form-item>

            <el-form-item label="职业">
              <el-input v-model="form.background.occupation" />
            </el-form-item>

            <el-form-item label="教育">
              <el-input v-model="form.background.education" />
            </el-form-item>

            <el-form-item label="家庭">
              <el-input v-model="form.background.family" />
            </el-form-item>

            <el-form-item label="历史">
              <el-input
                v-model="form.background.history"
                type="textarea"
                :rows="4"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="动机" name="motivation">
            <el-form-item label="目标">
              <el-input
                v-model="form.motivation.goals"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="恐惧">
              <el-input
                v-model="form.motivation.fears"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="欲望">
              <el-input
                v-model="form.motivation.desires"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="角色弧光" name="arc">
            <el-form-item label="起点">
              <el-input
                v-model="form.arc.startingPoint"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="关键事件">
              <el-input
                v-model="form.arc.keyEvents"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="终点">
              <el-input
                v-model="form.arc.endingPoint"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCharacter">保存</el-button>
          <el-button v-if="dialogType === 'create'" @click="showAIDialog = true">
            AI 生成
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- AI 生成对话框 -->
    <el-dialog
      v-model="aiDialogVisible"
      title="AI 生成角色"
      width="40%"
    >
      <el-form :model="aiForm" label-width="100px">
        <el-form-item label="角色类型">
          <el-select v-model="aiForm.role" placeholder="选择角色类型">
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="性格特征">
          <el-select
            v-model="aiForm.traits"
            multiple
            filterable
            allow-create
            placeholder="输入或选择性格特征"
          >
            <el-option
              v-for="trait in traitSuggestions"
              :key="trait"
              :label="trait"
              :value="trait"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="背景设定">
          <el-input
            v-model="aiForm.context"
            type="textarea"
            :rows="4"
            placeholder="输入角色的背景设定或故事情境..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="aiDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="generateCharacter">生成</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入角色"
      width="30%"
    >
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importCharacters">导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关系图谱对话框 -->
    <el-dialog
      v-model="relationshipGraphVisible"
      title="角色关系图谱"
      width="80%"
      fullscreen
    >
      <relationship-graph
        :characters="characters"
        :relationships="relationships"
        @edit-relationship="editRelationship"
      />
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
  Magic,
  Connection,
  DataAnalysis,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CharacterSuggestion } from '@/services/ai/character.service'
import { 
  getCharacterSuggestions,
  generateCharacterBackground,
  checkCharacterConflicts,
  optimizeCharacterRelationships
} from '@/services/ai/character.service'
import RelationshipGraph from './RelationshipGraph.vue'

const characterStore = useCharacterStore()

// 状态
const characters = ref<CharacterSuggestion[]>([])
const relationships = ref<any[]>([])
const searchQuery = ref('')
const selectedRole = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const aiDialogVisible = ref(false)
const importDialogVisible = ref(false)
const relationshipGraphVisible = ref(false)
const activeTab = ref('basic')
const traitInputVisible = ref(false)
const traitInputValue = ref('')
const currentCharacter = ref<CharacterSuggestion | null>(null)

// 表单
const formRef = ref<FormInstance>()
const form = ref({
  name: '',
  role: 'supporting' as const,
  archetype: '',
  avatar: '',
  personality: {
    traits: [] as string[],
    mbti: '',
    strengths: [] as string[],
    weaknesses: [] as string[]
  },
  background: {
    age: 25,
    occupation: '',
    education: '',
    family: '',
    history: ''
  },
  motivation: {
    goals: [] as string[],
    fears: [] as string[],
    desires: [] as string[]
  },
  arc: {
    startingPoint: '',
    keyEvents: [] as string[],
    endingPoint: ''
  }
})

const aiForm = ref({
  role: 'supporting',
  traits: [] as string[],
  context: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入角色姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色定位', trigger: 'change' }
  ],
  archetype: [
    { required: true, message: '请输入角色原型', trigger: 'blur' }
  ]
}

const aiRules: FormRules = {
  role: [
    { required: true, message: '请选择角色定位', trigger: 'change' }
  ],
  traits: [
    { required: true, message: '请至少选择一个特征', trigger: 'change' },
    { type: 'array', min: 1, max: 5, message: '请选择 1 到 5 个特征', trigger: 'change' }
  ]
}

// 特征标签输入
const traitInputRef = ref<HTMLInputElement>()

// 常用特征
const commonTraits = [
  '勇敢', '聪明', '善良', '固执', '谨慎',
  '乐观', '悲观', '正直', '狡猾', '忠诚',
  '自私', '慷慨', '傲慢', '谦虚', '冷静'
]

// MBTI类型
const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

// 计算属性
const filteredCharacters = computed(() => {
  let result = characters.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(char => 
      char.name.toLowerCase().includes(query) ||
      char.archetype.toLowerCase().includes(query) ||
      char.personality.traits.some(trait => trait.toLowerCase().includes(query))
    )
  }

  if (selectedRole.value !== 'all') {
    result = result.filter(char => char.role === selectedRole.value)
  }

  return result
})

// 加载角色列表
const loadCharacters = async () => {
  try {
    const data = await characterStore.getCharacters()
    characters.value = data
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
}

// 创建角色
const handleCreate = () => {
  dialogType.value = 'create'
  form.value = {
    name: '',
    role: 'supporting',
    archetype: '',
    avatar: '',
    personality: {
      traits: [],
      mbti: '',
      strengths: [],
      weaknesses: []
    },
    background: {
      age: 25,
      occupation: '',
      education: '',
      family: '',
      history: ''
    },
    motivation: {
      goals: [],
      fears: [],
      desires: []
    },
    arc: {
      startingPoint: '',
      keyEvents: [],
      endingPoint: ''
    }
  }
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (character: CharacterSuggestion) => {
  dialogType.value = 'edit'
  currentCharacter.value = character
  form.value = { ...character }
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (character: CharacterSuggestion) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该角色吗？相关的关系数据也会被删除。',
      '删除确认',
      {
        type: 'warning'
      }
    )
    await characterStore.deleteCharacter(character.id)
    ElMessage.success('删除成功')
    loadCharacters()
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
          await characterStore.createCharacter(form.value)
          ElMessage.success('创建角色成功')
        } else {
          await characterStore.updateCharacter(currentCharacter.value!.id, form.value)
          ElMessage.success('更新角色成功')
        }
        dialogVisible.value = false
        loadCharacters()
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      }
    }
  })
}

// 特征标签相关
const showTraitInput = () => {
  traitInputVisible.value = true
  nextTick(() => {
    traitInputRef.value?.input?.focus()
  })
}

const handleAddTrait = () => {
  if (traitInputValue.value) {
    form.value.personality.traits.push(traitInputValue.value)
  }
  traitInputVisible.value = false
  traitInputValue.value = ''
}

const handleRemoveTrait = (trait: string) => {
  const index = form.value.personality.traits.indexOf(trait)
  form.value.personality.traits.splice(index, 1)
}

// AI生成相关
const handleGenerateCharacter = () => {
  aiForm.value = {
    role: 'supporting',
    traits: [],
    context: ''
  }
  aiDialogVisible.value = true
}

const handleGenerateSubmit = async () => {
  if (!aiFormRef.value) return

  await aiFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const suggestions = await getCharacterSuggestions({
          role: aiForm.value.role,
          traits: aiForm.value.traits,
          context: aiForm.value.context
        })
        
        if (suggestions.length > 0) {
          const character = suggestions[0]
          form.value = { ...character }
          aiDialogVisible.value = false
          dialogType.value = 'create'
          dialogVisible.value = true
        } else {
          ElMessage.warning('未能生成合适的角色建议')
        }
      } catch (error) {
        ElMessage.error('生成失败')
      }
    }
  })
}

// 关系管理相关
const handleRelationship = (character: CharacterSuggestion) => {
  currentCharacter.value = character
  relationshipGraphVisible.value = true
}

const editRelationship = (source: string, target: string, type: string) => {
  // TODO: 实现关系编辑
}

// 工具函数
const getRoleType = (role: string): '' | 'success' | 'danger' => {
  const typeMap: Record<string, '' | 'success' | 'danger'> = {
    protagonist: 'success',
    antagonist: 'danger',
    supporting: ''
  }
  return typeMap[role] || ''
}

const getRoleText = (role: string): string => {
  const textMap: Record<string, string> = {
    protagonist: '主角',
    antagonist: '反派',
    supporting: '配角'
  }
  return textMap[role] || role
}

const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#F56C6C'
  if (percentage < 70) return '#E6A23C'
  return '#67C23A'
}

// 头像上传
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const handleAvatarSuccess = (response: any) => {
  form.value.avatar = response.url
}

// 导入相关
const handleFileChange = (file: File) => {
  // TODO: 处理文件上传
}

const importCharacters = async () => {
  try {
    // TODO: 实现导入逻辑
    importDialogVisible.value = false
    ElMessage.success('导入成功')
    loadCharacters()
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

// 初始化
onMounted(() => {
  loadCharacters()
})
</script>

<style scoped lang="scss">
.character-manager {
  padding: 20px;

  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }
  }

  .character-grid {
    margin-bottom: 20px;
  }

  .character-card {
    margin-bottom: 20px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    }

    .avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;

      .role-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }

    .info {
      text-align: center;

      .name {
        margin: 0 0 5px;
        font-size: 18px;
        font-weight: bold;
      }

      .archetype {
        margin: 0 0 10px;
        color: #666;
        font-size: 14px;
      }

      .traits {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-bottom: 15px;
      }

      .stats {
        .stat-item {
          margin-bottom: 10px;

          .label {
            display: block;
            margin-bottom: 5px;
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .actions {
      margin-top: 15px;
      display: flex;
      justify-content: center;
    }
  }

  .avatar-upload {
    text-align: center;

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 50%;
    }
  }

  .tag-input {
    width: 100px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .relationship-container {
    display: flex;
    gap: 20px;
    height: 600px;

    .relationship-graph {
      flex: 1;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }

    .relationship-list {
      width: 400px;
      overflow-y: auto;
    }
  }
}
</style> 
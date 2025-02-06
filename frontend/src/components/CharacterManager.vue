<template>
  <div class="character-manager">
    <div class="toolbar">
      <el-button type="primary" @click="createCharacter">
        <el-icon><Plus /></el-icon>
        新建角色
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索角色..."
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

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
          <el-card class="character-card" :body-style="{ padding: '0px' }">
            <div class="character-header">
              <span class="character-type" :class="character.type">
                {{ getCharacterTypeLabel(character.type) }}
              </span>
            </div>
            <div class="character-content">
              <h3 class="character-name">{{ character.name }}</h3>
              <p class="character-description">{{ character.description }}</p>
              <div class="character-tags">
                <el-tag
                  v-for="tag in character.tags"
                  :key="tag"
                  size="small"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="character-footer">
              <el-button-group>
                <el-button
                  size="small"
                  @click="editCharacter(character)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  @click="viewCharacter(character)"
                >
                  查看
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteCharacter(character)"
                >
                  删除
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="characterFormRef"
        :model="characterForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="characterForm.name" />
        </el-form-item>

        <el-form-item label="角色类型" prop="type">
          <el-select v-model="characterForm.type">
            <el-option
              v-for="type in characterTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="characterForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="性格特征" prop="personality">
          <el-select
            v-model="characterForm.personality"
            multiple
            filterable
            allow-create
          >
            <el-option
              v-for="trait in personalityTraits"
              :key="trait"
              :label="trait"
              :value="trait"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="背景故事" prop="background">
          <el-input
            v-model="characterForm.background"
            type="textarea"
            :rows="5"
          />
        </el-form-item>

        <el-form-item label="关键信息" prop="keyInfo">
          <el-input
            v-model="characterForm.keyInfo"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="characterForm.tags"
            multiple
            filterable
            allow-create
          >
            <el-option
              v-for="tag in characterTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="saveCharacter">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 角色详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="角色详情"
      width="50%"
    >
      <div v-if="selectedCharacter" class="character-detail">
        <h2>{{ selectedCharacter.name }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="角色类型">
            {{ getCharacterTypeLabel(selectedCharacter.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="性格特征">
            <el-tag
              v-for="trait in selectedCharacter.personality"
              :key="trait"
              size="small"
              class="trait-tag"
            >
              {{ trait }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="角色描述">
            {{ selectedCharacter.description }}
          </el-descriptions-item>
          <el-descriptions-item label="背景故事">
            {{ selectedCharacter.background }}
          </el-descriptions-item>
          <el-descriptions-item label="关键信息">
            {{ selectedCharacter.keyInfo }}
          </el-descriptions-item>
          <el-descriptions-item label="标签">
            <el-tag
              v-for="tag in selectedCharacter.tags"
              :key="tag"
              size="small"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
  scriptId: string
}>()

// 状态
const searchQuery = ref('')
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const characterFormRef = ref<FormInstance>()
const selectedCharacter = ref<any>(null)

// 表单数据
const characterForm = ref({
  id: '',
  name: '',
  type: '',
  description: '',
  personality: [],
  background: '',
  keyInfo: '',
  tags: []
})

// 角色类型
const characterTypes = [
  { label: '主要角色', value: 'main' },
  { label: '配角', value: 'supporting' },
  { label: 'NPC', value: 'npc' }
]

// 性格特征
const personalityTraits = [
  '开朗', '内向', '善良', '狡猾', '正直',
  '自私', '勇敢', '懦弱', '理性', '感性',
  '谨慎', '冲动', '专注', '多疑', '乐观'
]

// 角色标签
const characterTags = [
  '关键人物', '知情者', '受害者', '嫌疑人',
  '帮手', '阻碍者', '红鲱鱼', '背景板'
]

// 表单验证规则
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
})

// 计算属性
const dialogTitle = computed(() => {
  return characterForm.value.id ? '编辑角色' : '新建角色'
})

const filteredCharacters = computed(() => {
  // TODO: 从 store 获取角色列表并过滤
  return []
})

// 方法
const getCharacterTypeLabel = (type: string) => {
  return characterTypes.find(t => t.value === type)?.label || type
}

const createCharacter = () => {
  characterForm.value = {
    id: '',
    name: '',
    type: '',
    description: '',
    personality: [],
    background: '',
    keyInfo: '',
    tags: []
  }
  dialogVisible.value = true
}

const editCharacter = (character: any) => {
  characterForm.value = { ...character }
  dialogVisible.value = true
}

const viewCharacter = (character: any) => {
  selectedCharacter.value = character
  detailDialogVisible.value = true
}

const deleteCharacter = async (character: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该角色吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // TODO: 调用 store 的删除方法
  } catch {
    // 用户取消删除
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  if (characterFormRef.value) {
    characterFormRef.value.resetFields()
  }
}

const saveCharacter = async () => {
  if (!characterFormRef.value) return

  await characterFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // TODO: 调用 store 的保存方法
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.character-manager {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.character-list {
  margin-top: 20px;
}

.character-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.character-header {
  padding: 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.character-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.character-type.main {
  background-color: #f0f9eb;
  color: #67c23a;
}

.character-type.supporting {
  background-color: #f4f4f5;
  color: #909399;
}

.character-type.npc {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.character-content {
  padding: 16px;
}

.character-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.character-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.character-footer {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
}

.tag {
  margin-right: 5px;
}

.trait-tag {
  margin: 0 5px 5px 0;
}

.character-detail {
  padding: 20px;
}

.character-detail h2 {
  margin-bottom: 20px;
  text-align: center;
}
</style> 
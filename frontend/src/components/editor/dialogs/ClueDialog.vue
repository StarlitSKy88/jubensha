<template>
  <el-dialog
    :title="clue ? '编辑线索' : '添加线索'"
    :visible="visible"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="线索名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入线索名称" />
      </el-form-item>

      <el-form-item label="线索描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入线索描述"
        />
      </el-form-item>

      <el-form-item label="线索类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="物品">物品</el-radio>
          <el-radio label="对话">对话</el-radio>
          <el-radio label="场景">场景</el-radio>
          <el-radio label="文档">文档</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="相关角色" prop="relatedCharacters">
        <el-select
          v-model="form.relatedCharacters"
          multiple
          filterable
          placeholder="请选择相关角色"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="发现条件" prop="discoveryConditions">
        <div v-for="(condition, index) in form.discoveryConditions" :key="index" class="condition-item">
          <el-input v-model="form.discoveryConditions[index]" placeholder="请输入发现条件">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeCondition(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addCondition">添加条件</el-button>
      </el-form-item>

      <el-form-item label="重要程度" prop="importance">
        <el-rate
          v-model="form.importance"
          :max="5"
          :texts="['不重要', '次要', '普通', '重要', '关键']"
          show-text
        />
      </el-form-item>

      <el-form-item label="关键线索">
        <el-switch
          v-model="form.isKey"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      <el-button v-if="!clue" type="success" :loading="loading" @click="handleAIGenerate">
        AI 生成
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Clue, Character } from '@/types/script'
import { useScriptStore } from '@/stores/script'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  visible: boolean
  clue?: Clue
  characters: Character[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', clue: Omit<Clue, 'id'>): void
}>()

const scriptStore = useScriptStore()
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 表单相关
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  name: '',
  description: '',
  type: '物品' as '物品' | '对话' | '场景' | '文档',
  relatedCharacters: [] as string[],
  discoveryConditions: [] as string[],
  importance: 3,
  isKey: false
})

const rules = {
  name: [
    { required: true, message: '请输入线索名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入线索描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择线索类型', trigger: 'change' }
  ],
  relatedCharacters: [
    { required: true, message: '请选择相关角色', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个角色', trigger: 'change' }
  ],
  importance: [
    { required: true, message: '请选择重要程度', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '重要程度必须在 1-5 之间', trigger: 'change' }
  ]
}

// 方法
const initForm = () => {
  if (props.clue) {
    form.value = {
      name: props.clue.name,
      description: props.clue.description,
      type: props.clue.type,
      relatedCharacters: [...props.clue.relatedCharacters],
      discoveryConditions: [...props.clue.discoveryConditions],
      importance: props.clue.importance,
      isKey: props.clue.isKey
    }
  } else {
    form.value = {
      name: '',
      description: '',
      type: '物品',
      relatedCharacters: [],
      discoveryConditions: [],
      importance: 3,
      isKey: false
    }
  }
}

const addCondition = () => {
  form.value.discoveryConditions.push('')
}

const removeCondition = (index: number) => {
  form.value.discoveryConditions.splice(index, 1)
}

const handleClose = () => {
  emit('update:visible', false)
  initForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    startMeasure('submit-clue')
    loading.value = true

    const clue: Omit<Clue, 'id'> = {
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
      relatedCharacters: form.value.relatedCharacters,
      discoveryConditions: form.value.discoveryConditions.filter(Boolean),
      importance: form.value.importance,
      isKey: form.value.isKey
    }

    emit('submit', clue)
    handleClose()
  } catch (error) {
    console.error('表单验证失败：', error)
  } finally {
    loading.value = false
    endMeasure('submit-clue')
  }
}

const handleAIGenerate = async () => {
  startMeasure('ai-generate-clue')
  loading.value = true

  try {
    const clue = await scriptStore.generateClue({
      characters: props.characters
    })
    form.value = {
      name: clue.name,
      description: clue.description,
      type: clue.type,
      relatedCharacters: clue.relatedCharacters,
      discoveryConditions: clue.discoveryConditions,
      importance: clue.importance,
      isKey: clue.isKey
    }
  } catch (error) {
    console.error('生成线索失败：', error)
  } finally {
    loading.value = false
    endMeasure('ai-generate-clue')
  }
}

// 初始化
initForm()
</script>

<style scoped lang="scss">
.condition-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  .el-input {
    flex: 1;
  }
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

:deep(.el-rate) {
  margin-top: 8px;
}
</style> 
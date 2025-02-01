<template>
  <el-dialog
    :title="character ? '编辑角色' : '添加角色'"
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
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色姓名" />
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="1" :max="150" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
          <el-radio label="其他">其他</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="职业" prop="occupation">
        <el-input v-model="form.occupation" placeholder="请输入角色职业" />
      </el-form-item>

      <el-form-item label="背景" prop="background">
        <el-input
          v-model="form.background"
          type="textarea"
          :rows="4"
          placeholder="请输入角色背景故事"
        />
      </el-form-item>

      <el-form-item label="性格特征" prop="personality">
        <el-select
          v-model="form.personality"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或输入性格特征"
        >
          <el-option
            v-for="item in personalityOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="人际关系">
        <div v-for="(relation, charId) in form.relationships" :key="charId" class="relation-item">
          <el-select v-model="relationCharacters[charId]" placeholder="选择角色">
            <el-option
              v-for="char in otherCharacters"
              :key="char.id"
              :label="char.name"
              :value="char.id"
            />
          </el-select>
          <el-input v-model="form.relationships[charId]" placeholder="关系描述" />
          <el-button type="danger" icon="el-icon-delete" @click="removeRelation(charId)" />
        </div>
        <el-button type="primary" plain @click="addRelation">添加关系</el-button>
      </el-form-item>

      <el-form-item label="秘密" prop="secrets">
        <div v-for="(secret, index) in form.secrets" :key="index" class="secret-item">
          <el-input v-model="form.secrets[index]" placeholder="请输入秘密">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeSecret(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addSecret">添加秘密</el-button>
      </el-form-item>

      <el-form-item label="目标" prop="goals">
        <div v-for="(goal, index) in form.goals" :key="index" class="goal-item">
          <el-input v-model="form.goals[index]" placeholder="请输入目标">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeGoal(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addGoal">添加目标</el-button>
      </el-form-item>

      <el-form-item label="随身物品" prop="items">
        <div v-for="(item, index) in form.items" :key="index" class="item-item">
          <el-input v-model="form.items[index]" placeholder="请输入物品">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeItem(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addItem">添加物品</el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      <el-button v-if="!character" type="success" :loading="loading" @click="handleAIGenerate">
        AI 生成
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Character } from '@/types/script'
import { useScriptStore } from '@/stores/script'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  visible: boolean
  character?: Character
  otherCharacters: Character[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', character: Omit<Character, 'id'>): void
}>()

const scriptStore = useScriptStore()
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 表单相关
const formRef = ref<FormInstance>()
const loading = ref(false)
const relationCharacters = ref<Record<string, string>>({})

const personalityOptions = [
  '开朗', '内向', '谨慎', '冲动',
  '理性', '感性', '乐观', '悲观',
  '正直', '狡诈', '善良', '邪恶'
]

const form = ref({
  name: '',
  age: 25,
  gender: '男' as '男' | '女' | '其他',
  occupation: '',
  background: '',
  personality: [] as string[],
  relationships: {} as Record<string, string>,
  secrets: [] as string[],
  goals: [] as string[],
  items: [] as string[]
})

const rules = {
  name: [
    { required: true, message: '请输入角色姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入角色年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 150, message: '年龄必须在 1 到 150 岁之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择角色性别', trigger: 'change' }
  ],
  occupation: [
    { required: true, message: '请输入角色职业', trigger: 'blur' }
  ],
  background: [
    { required: true, message: '请输入角色背景故事', trigger: 'blur' }
  ],
  personality: [
    { required: true, message: '请至少选择一个性格特征', trigger: 'change' }
  ]
}

// 计算属性
const otherCharacterOptions = computed(() => {
  return props.otherCharacters.map(char => ({
    label: char.name,
    value: char.id
  }))
})

// 方法
const initForm = () => {
  if (props.character) {
    form.value = {
      name: props.character.name,
      age: props.character.age,
      gender: props.character.gender,
      occupation: props.character.occupation,
      background: props.character.background,
      personality: [...props.character.personality],
      relationships: { ...props.character.relationships },
      secrets: [...props.character.secrets],
      goals: [...props.character.goals],
      items: [...props.character.items]
    }
  } else {
    form.value = {
      name: '',
      age: 25,
      gender: '男',
      occupation: '',
      background: '',
      personality: [],
      relationships: {},
      secrets: [],
      goals: [],
      items: []
    }
  }
}

const addRelation = () => {
  const id = Date.now().toString()
  form.value.relationships[id] = ''
  relationCharacters.value[id] = ''
}

const removeRelation = (id: string) => {
  delete form.value.relationships[id]
  delete relationCharacters.value[id]
}

const addSecret = () => {
  form.value.secrets.push('')
}

const removeSecret = (index: number) => {
  form.value.secrets.splice(index, 1)
}

const addGoal = () => {
  form.value.goals.push('')
}

const removeGoal = (index: number) => {
  form.value.goals.splice(index, 1)
}

const addItem = () => {
  form.value.items.push('')
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const handleClose = () => {
  emit('update:visible', false)
  initForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    startMeasure('submit-character')
    loading.value = true

    // 处理关系数据
    const relationships = new Map<string, string>()
    Object.entries(form.value.relationships).forEach(([tempId, description]) => {
      const charId = relationCharacters.value[tempId]
      if (charId && description) {
        relationships.set(charId, description)
      }
    })

    const character: Omit<Character, 'id'> = {
      name: form.value.name,
      age: form.value.age,
      gender: form.value.gender,
      occupation: form.value.occupation,
      background: form.value.background,
      personality: form.value.personality,
      relationships: relationships,
      secrets: form.value.secrets.filter(Boolean),
      goals: form.value.goals.filter(Boolean),
      items: form.value.items.filter(Boolean)
    }

    emit('submit', character)
    handleClose()
  } catch (error) {
    console.error('表单验证失败：', error)
  } finally {
    loading.value = false
    endMeasure('submit-character')
  }
}

const handleAIGenerate = async () => {
  startMeasure('ai-generate-character')
  loading.value = true

  try {
    const character = await scriptStore.generateCharacter()
    form.value = {
      name: character.name,
      age: character.age,
      gender: character.gender,
      occupation: character.occupation,
      background: character.background,
      personality: character.personality,
      relationships: {},
      secrets: character.secrets,
      goals: character.goals,
      items: character.items
    }
  } catch (error) {
    console.error('生成角色失败：', error)
  } finally {
    loading.value = false
    endMeasure('ai-generate-character')
  }
}

// 初始化
initForm()
</script>

<style scoped lang="scss">
.relation-item,
.secret-item,
.goal-item,
.item-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  .el-select {
    width: 200px;
  }

  .el-input {
    flex: 1;
  }
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}
</style> 
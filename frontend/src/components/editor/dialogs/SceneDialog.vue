<template>
  <el-dialog
    :title="scene ? '编辑场景' : '添加场景'"
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
      <el-form-item label="场景名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入场景名称" />
      </el-form-item>

      <el-form-item label="场景描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入场景描述"
        />
      </el-form-item>

      <el-form-item label="场景位置" prop="location">
        <el-input v-model="form.location" placeholder="请输入场景位置" />
      </el-form-item>

      <el-form-item label="场景时间" prop="time">
        <el-input v-model="form.time" placeholder="请输入场景发生的时间" />
      </el-form-item>

      <el-form-item label="参与角色" prop="participants">
        <el-select
          v-model="form.participants"
          multiple
          filterable
          placeholder="请选择参与角色"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="相关线索" prop="clues">
        <el-select
          v-model="form.clues"
          multiple
          filterable
          placeholder="请选择相关线索"
        >
          <el-option
            v-for="clue in clues"
            :key="clue.id"
            :label="clue.name"
            :value="clue.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="事件列表" prop="events">
        <div v-for="(event, index) in form.events" :key="index" class="event-item">
          <el-input v-model="form.events[index]" placeholder="请输入事件描述">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeEvent(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addEvent">添加事件</el-button>
      </el-form-item>

      <el-form-item label="前置要求" prop="requirements">
        <div v-for="(req, index) in form.requirements" :key="index" class="requirement-item">
          <el-input v-model="form.requirements[index]" placeholder="请输入前置要求">
            <template #append>
              <el-button type="danger" icon="el-icon-delete" @click="removeRequirement(index)" />
            </template>
          </el-input>
        </div>
        <el-button type="primary" plain @click="addRequirement">添加要求</el-button>
      </el-form-item>

      <el-form-item label="后续场景" prop="nextScenes">
        <el-select
          v-model="form.nextScenes"
          multiple
          filterable
          placeholder="请选择后续场景"
        >
          <el-option
            v-for="s in otherScenes"
            :key="s.id"
            :label="s.name"
            :value="s.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      <el-button v-if="!scene" type="success" :loading="loading" @click="handleAIGenerate">
        AI 生成
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Scene, Character, Clue } from '@/types/script'
import { useScriptStore } from '@/stores/script'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  visible: boolean
  scene?: Scene
  characters: Character[]
  clues: Clue[]
  scenes: Scene[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', scene: Omit<Scene, 'id'>): void
}>()

const scriptStore = useScriptStore()
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 表单相关
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  name: '',
  description: '',
  location: '',
  time: '',
  participants: [] as string[],
  clues: [] as string[],
  events: [] as string[],
  requirements: [] as string[],
  nextScenes: [] as string[]
})

const rules = {
  name: [
    { required: true, message: '请输入场景名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入场景描述', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入场景位置', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请输入场景时间', trigger: 'blur' }
  ],
  participants: [
    { required: true, message: '请选择参与角色', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个角色', trigger: 'change' }
  ]
}

// 计算属性
const otherScenes = computed(() => {
  return props.scenes.filter(s => !props.scene || s.id !== props.scene.id)
})

// 方法
const initForm = () => {
  if (props.scene) {
    form.value = {
      name: props.scene.name,
      description: props.scene.description,
      location: props.scene.location,
      time: props.scene.time,
      participants: [...props.scene.participants],
      clues: [...props.scene.clues],
      events: [...props.scene.events],
      requirements: [...props.scene.requirements],
      nextScenes: [...props.scene.nextScenes]
    }
  } else {
    form.value = {
      name: '',
      description: '',
      location: '',
      time: '',
      participants: [],
      clues: [],
      events: [],
      requirements: [],
      nextScenes: []
    }
  }
}

const addEvent = () => {
  form.value.events.push('')
}

const removeEvent = (index: number) => {
  form.value.events.splice(index, 1)
}

const addRequirement = () => {
  form.value.requirements.push('')
}

const removeRequirement = (index: number) => {
  form.value.requirements.splice(index, 1)
}

const handleClose = () => {
  emit('update:visible', false)
  initForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    startMeasure('submit-scene')
    loading.value = true

    const scene: Omit<Scene, 'id'> = {
      name: form.value.name,
      description: form.value.description,
      location: form.value.location,
      time: form.value.time,
      participants: form.value.participants,
      clues: form.value.clues,
      events: form.value.events.filter(Boolean),
      requirements: form.value.requirements.filter(Boolean),
      nextScenes: form.value.nextScenes
    }

    emit('submit', scene)
    handleClose()
  } catch (error) {
    console.error('表单验证失败：', error)
  } finally {
    loading.value = false
    endMeasure('submit-scene')
  }
}

const handleAIGenerate = async () => {
  startMeasure('ai-generate-scene')
  loading.value = true

  try {
    const scene = await scriptStore.generateScene({
      characters: props.characters,
      previousScenes: props.scenes
    })
    form.value = {
      name: scene.name,
      description: scene.description,
      location: scene.location,
      time: scene.time,
      participants: scene.participants,
      clues: scene.clues,
      events: scene.events,
      requirements: scene.requirements,
      nextScenes: []
    }
  } catch (error) {
    console.error('生成场景失败：', error)
  } finally {
    loading.value = false
    endMeasure('ai-generate-scene')
  }
}

// 初始化
initForm()
</script>

<style scoped lang="scss">
.event-item,
.requirement-item {
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
</style> 
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑场景' : '新建场景'"
    width="50%"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="场景标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入场景标题" />
      </el-form-item>
      
      <el-form-item label="场景描述" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入场景描述"
        />
      </el-form-item>
      
      <el-form-item label="场景角色">
        <el-select
          v-model="form.characters"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或添加角色"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="父场景">
        <el-cascader
          v-model="form.parentId"
          :options="sceneTree"
          :props="{
            value: 'id',
            label: 'title',
            children: 'children'
          }"
          clearable
          placeholder="请选择父场景"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Character, Scene } from '@/types/script'

const props = defineProps<{
  visible: boolean
  scene?: Scene
  characters: Character[]
  scenes: Scene[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', scene: Partial<Scene>): void
}>()

const dialogVisible = ref(props.visible)
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = ref<Partial<Scene>>({
  title: '',
  content: '',
  characters: [],
  parentId: undefined
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入场景标题', trigger: 'blur' },
    { max: 100, message: '标题不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入场景描述', trigger: 'blur' }
  ]
}

// 计算场景树
const sceneTree = computed(() => {
  const buildTree = (scenes: Scene[], parentId?: string): any[] => {
    return scenes
      .filter(scene => scene.parentId === parentId)
      .map(scene => ({
        id: scene.id,
        title: scene.title,
        children: buildTree(scenes, scene.id)
      }))
  }
  
  return buildTree(props.scenes)
})

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
  }
)

// 监听dialogVisible变化
watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 监听scene变化
watch(
  () => props.scene,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = {
        title: '',
        content: '',
        characters: [],
        parentId: undefined
      }
    }
  },
  { immediate: true }
)

const isEdit = computed(() => !!props.scene)

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    emit('submit', form.value)
    dialogVisible.value = false
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    saving.value = false
  }
}
</script> 
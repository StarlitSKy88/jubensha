<template>
  <div class="script-basic-info">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="剧本名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入剧本名称" />
      </el-form-item>

      <el-form-item label="剧本类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择剧本类型">
          <el-option
            v-for="type in scriptTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="难度等级" prop="difficulty">
        <el-rate
          v-model="formData.difficulty"
          :max="5"
          :texts="difficultyTexts"
          show-text
        />
      </el-form-item>

      <el-form-item label="游戏时长" prop="duration">
        <el-input-number
          v-model="formData.duration"
          :min="30"
          :max="360"
          :step="30"
        />
        <span class="unit-text">分钟</span>
      </el-form-item>

      <el-form-item label="人数范围" prop="playerCount">
        <el-col :span="11">
          <el-input-number
            v-model="formData.minPlayers"
            :min="1"
            :max="formData.maxPlayers"
            @change="handlePlayerCountChange"
          />
        </el-col>
        <el-col :span="2" class="text-center">
          <span class="range-separator">至</span>
        </el-col>
        <el-col :span="11">
          <el-input-number
            v-model="formData.maxPlayers"
            :min="formData.minPlayers"
            :max="20"
            @change="handlePlayerCountChange"
          />
        </el-col>
      </el-form-item>

      <el-form-item label="剧本标签" prop="tags">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或输入标签"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="剧本简介" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入剧本简介"
        />
      </el-form-item>

      <el-form-item label="背景故事" prop="background">
        <el-input
          v-model="formData.background"
          type="textarea"
          :rows="6"
          placeholder="请输入背景故事"
        />
      </el-form-item>

      <el-form-item label="注意事项" prop="notes">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="4"
          placeholder="请输入注意事项"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref({
  title: props.modelValue?.title || '',
  type: props.modelValue?.type || '',
  difficulty: props.modelValue?.difficulty || 3,
  duration: props.modelValue?.duration || 120,
  minPlayers: props.modelValue?.minPlayers || 6,
  maxPlayers: props.modelValue?.maxPlayers || 8,
  tags: props.modelValue?.tags || [],
  description: props.modelValue?.description || '',
  background: props.modelValue?.background || '',
  notes: props.modelValue?.notes || ''
})

// 剧本类型选项
const scriptTypes = [
  { label: '情感本', value: 'emotion' },
  { label: '推理本', value: 'detective' },
  { label: '机制本', value: 'mechanism' },
  { label: '欢乐本', value: 'happy' },
  { label: '恐怖本', value: 'horror' }
]

// 难度等级文本
const difficultyTexts = ['新手', '简单', '适中', '困难', '专家']

// 常用标签
const commonTags = [
  '情感',
  '推理',
  '机制',
  '欢乐',
  '恐怖',
  '硬核',
  '新手友好',
  '剧情向',
  '机制向',
  '还原向'
]

// 表单验证规则
const rules = ref<FormRules>({
  title: [
    { required: true, message: '请输入剧本名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择剧本类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入剧本简介', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
})

// 处理人数范围变化
const handlePlayerCountChange = () => {
  if (formData.value.minPlayers > formData.value.maxPlayers) {
    formData.value.maxPlayers = formData.value.minPlayers
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      emit('update:modelValue', { ...formData.value })
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.script-basic-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.unit-text {
  margin-left: 10px;
  color: #606266;
}

.range-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  color: #606266;
}

.text-center {
  text-align: center;
}
</style> 
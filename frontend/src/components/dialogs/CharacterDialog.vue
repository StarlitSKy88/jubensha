<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑角色' : '新建角色'"
    width="50%"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" />
      </el-form-item>
      
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入角色描述"
        />
      </el-form-item>
      
      <el-form-item label="角色标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或添加标签"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="AI分析">
        <el-button
          type="primary"
          plain
          :loading="analyzing"
          @click="analyzeCharacter"
        >
          分析角色
        </el-button>
        <div v-if="analysis" class="analysis-result">
          {{ analysis }}
        </div>
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Character } from '@/types/script'
import { useScriptStore } from '@/stores/script'

const props = defineProps<{
  visible: boolean
  character?: Character
  availableTags?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', character: Partial<Character>): void
}>()

const scriptStore = useScriptStore()
const dialogVisible = ref(props.visible)
const formRef = ref<FormInstance>()
const saving = ref(false)
const analyzing = ref(false)
const analysis = ref('')

const form = ref<Partial<Character>>({
  name: '',
  description: '',
  tags: []
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

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

// 监听character变化
watch(
  () => props.character,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = {
        name: '',
        description: '',
        tags: []
      }
    }
  },
  { immediate: true }
)

const isEdit = computed(() => !!props.character)

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

async function analyzeCharacter() {
  if (!form.value.description) {
    ElMessage.warning('请先填写角色描述')
    return
  }
  
  analyzing.value = true
  try {
    const suggestion = await scriptStore.getAISuggestion({
      scriptId: '',
      action: 'character',
      context: form.value.description
    })
    analysis.value = suggestion.content
  } catch (error) {
    console.error('Failed to analyze character:', error)
    ElMessage.error('角色分析失败')
  } finally {
    analyzing.value = false
  }
}
</script>

<style scoped lang="scss">
.analysis-result {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}
</style> 
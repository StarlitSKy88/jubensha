<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="settings-header">
          <h2>个人设置</h2>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存设置
          </el-button>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        label-position="top"
      >
        <el-form-item label="语言">
          <el-select v-model="form.language" placeholder="请选择语言">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时区">
          <el-select v-model="form.timezone" placeholder="请选择时区">
            <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
            <el-option label="UTC" value="UTC" />
            <el-option label="太平洋时间 (UTC-8)" value="America/Los_Angeles" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="主题">
          <el-select v-model="form.theme" placeholder="请选择主题">
            <el-option label="浅色" value="light" />
            <el-option label="深色" value="dark" />
            <el-option label="跟随系统" value="auto" />
          </el-select>
        </el-form-item>
        
        <el-divider>通知设置</el-divider>
        
        <el-form-item>
          <el-switch
            v-model="form.notification_email"
            active-text="接收邮件通知"
          />
        </el-form-item>
        
        <el-form-item>
          <el-switch
            v-model="form.notification_web"
            active-text="接收网页通知"
          />
        </el-form-item>
        
        <el-divider>账号安全</el-divider>
        
        <el-form-item>
          <el-button type="primary" plain @click="showChangePasswordDialog">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialog.visible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-position="top"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="passwordDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="passwordDialog.loading"
          @click="handleChangePassword"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const saving = ref(false)

const { settings } = storeToRefs(profileStore)

const form = ref({
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  theme: 'light',
  notification_email: true,
  notification_web: true
})

onMounted(async () => {
  try {
    await profileStore.fetchSettings()
    if (settings.value) {
      form.value = { ...settings.value }
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    ElMessage.error('获取设置失败')
  }
})

async function handleSave() {
  try {
    saving.value = true
    await profileStore.updateSettings(form.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 修改密码相关
const passwordFormRef = ref<FormInstance>()
const passwordDialog = ref({
  visible: false,
  loading: false
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function showChangePasswordDialog() {
  passwordDialog.value.visible = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordDialog.value.loading = true
    
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    ElMessage.success('密码修改成功')
    passwordDialog.value.visible = false
  } catch (error: any) {
    console.error('Failed to change password:', error)
    ElMessage.error(error.response?.data?.detail || '密码修改失败')
  } finally {
    passwordDialog.value.loading = false
  }
}
</script>

<style scoped lang="scss">
.settings-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
  }
}

:deep(.el-switch) {
  margin-right: 8px;
}
</style> 
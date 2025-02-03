<template>
  <div class="p-6">
    <el-card class="max-w-3xl mx-auto">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="profile">
          <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="头像">
              <avatar-upload v-model="formData.avatar" />
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" />
            </el-form-item>

            <el-form-item label="昵称" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>

            <el-form-item label="界面设置">
              <el-form-item label="主题">
                <el-select v-model="formData.settings.theme">
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                  <el-option label="跟随系统" value="system" />
                </el-select>
              </el-form-item>

              <el-form-item label="语言">
                <el-select v-model="formData.settings.language">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>

              <el-form-item label="通知">
                <el-switch v-model="formData.settings.notifications" />
              </el-form-item>

              <el-form-item label="两步验证">
                <el-switch v-model="formData.settings.twoFactorEnabled" />
              </el-form-item>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleProfileUpdate" :loading="loading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordForm"
            :model="passwordData"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordData.oldPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordData.newPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordData.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handlePasswordChange" :loading="loading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="数据统计" name="statistics">
          <statistics />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { User, RuleType } from '@/types/user'
import Statistics from '@/components/user/Statistics.vue'

const authStore = useAuthStore()
const activeTab = ref('profile')
const loading = ref(false)

interface FormData {
  username: string;
  email: string;
  name: string;
  avatar?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    twoFactorEnabled: boolean;
  };
}

const formData = reactive<FormData>({
  username: '',
  email: '',
  name: '',
  settings: {
    theme: 'system',
    language: 'zh-CN',
    notifications: true,
    twoFactorEnabled: false
  }
})

const passwordData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as RuleType, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
  }

  return isImage && isLt2M
}

const handleAvatarSuccess = (response: { url: string }) => {
  formData.avatar = response.url
  ElMessage.success('头像上传成功')
}

const handleProfileUpdate = async () => {
  try {
    loading.value = true
    await authStore.updateProfile({
      username: formData.username,
      email: formData.email,
      name: formData.name,
      avatar: formData.avatar,
      settings: formData.settings
    })
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    ElMessage.error('更新失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

const handlePasswordChange = async () => {
  try {
    loading.value = true
    await authStore.changePassword(passwordData.oldPassword, passwordData.newPassword)
    ElMessage.success('密码修改成功')
    passwordData.oldPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
  } catch (error) {
    ElMessage.error('修改失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    const user = authStore.user
    formData.username = user.username
    formData.email = user.email
    formData.name = user.name || ''
    formData.avatar = user.avatar
    formData.settings = { ...user.settings }
  }
})
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style> 
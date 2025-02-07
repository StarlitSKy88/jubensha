<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1>个人信息</h1>
      <p>管理您的账号信息和偏好设置</p>
    </div>

    <div class="profile-content">
      <form class="profile-form" @submit.prevent="handleSubmit">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img 
              v-if="form.avatar" 
              :src="form.avatar" 
              :alt="form.name"
              class="avatar"
            >
            <div v-else class="avatar-placeholder">
              {{ form.name?.[0]?.toUpperCase() }}
            </div>
            <div class="avatar-overlay">
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="avatar-input"
              >
              <i class="icon-camera"></i>
            </div>
          </div>
          <p class="avatar-tip">点击更换头像</p>
        </div>

        <div class="form-group">
          <label for="name">姓名</label>
          <div class="input-wrapper">
            <i class="icon-user"></i>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="请输入姓名"
              :class="{ error: errors.name }"
              @input="validateName"
            >
          </div>
          <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-wrapper">
            <i class="icon-mail"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              :class="{ error: errors.email }"
              @input="validateEmail"
            >
          </div>
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="bio">个人简介</label>
          <div class="input-wrapper">
            <textarea
              id="bio"
              v-model="form.bio"
              placeholder="请输入个人简介"
              :class="{ error: errors.bio }"
              @input="validateBio"
            ></textarea>
          </div>
          <span class="error-message" v-if="errors.bio">{{ errors.bio }}</span>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn-secondary"
            @click="resetForm"
            :disabled="isLoading"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="isLoading || !isValid"
          >
            <span v-if="!isLoading">保存更改</span>
            <i v-else class="icon-spinner animate-spin"></i>
          </button>
        </div>
      </form>

      <div class="danger-zone">
        <h2>危险操作</h2>
        <div class="danger-actions">
          <button 
            class="btn-danger"
            @click="showDeleteConfirm = true"
          >
            删除账号
          </button>
        </div>
      </div>
    </div>

    <!-- 删除账号确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal">
        <h2>删除账号</h2>
        <p>此操作将永久删除您的账号和所有相关数据，且无法恢复。</p>
        <div class="modal-actions">
          <button 
            class="btn-secondary"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button 
            class="btn-danger"
            @click="handleDeleteAccount"
            :disabled="isDeleting"
          >
            <span v-if="!isDeleting">确认删除</span>
            <i v-else class="icon-spinner animate-spin"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

interface ProfileForm {
  name: string
  email: string
  avatar?: string
  bio?: string
}

interface FormErrors {
  name?: string
  email?: string
  bio?: string
}

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const form = ref<ProfileForm>({
  name: '',
  email: '',
  avatar: '',
  bio: ''
})

const errors = ref<FormErrors>({})
const isLoading = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

// 初始化表单数据
onMounted(async () => {
  const user = userStore.currentUser
  if (user) {
    form.value = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    }
  }
})

// 表单验证
const validateName = () => {
  if (!form.value.name) {
    errors.value.name = '请输入姓名'
  } else if (form.value.name.length < 2) {
    errors.value.name = '姓名长度不能少于2个字符'
  } else {
    delete errors.value.name
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    errors.value.email = '请输入邮箱'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = '请输入有效的邮箱地址'
  } else {
    delete errors.value.email
  }
}

const validateBio = () => {
  if (form.value.bio && form.value.bio.length > 200) {
    errors.value.bio = '个人简介不能超过200个字符'
  } else {
    delete errors.value.bio
  }
}

// 表单是否有效
const isValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         !errors.value.name && 
         !errors.value.email && 
         !errors.value.bio
})

// 处理头像上传
const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const response = await fetch('/api/users/me/avatar', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('上传头像失败')
    }

    const data = await response.json()
    form.value.avatar = data.avatarUrl

    notificationStore.addNotification({
      title: '上传成功',
      description: '头像已更新',
      type: 'success'
    })
  } catch (error) {
    notificationStore.addNotification({
      title: '上传失败',
      description: '请稍后重试',
      type: 'error'
    })
  }
}

// 重置表单
const resetForm = () => {
  const user = userStore.currentUser
  if (user) {
    form.value = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    }
  }
  errors.value = {}
}

// 处理表单提交
const handleSubmit = async () => {
  validateName()
  validateEmail()
  validateBio()
  
  if (!isValid.value) return
  
  isLoading.value = true
  
  try {
    await userStore.updateProfile(form.value)
    notificationStore.addNotification({
      title: '更新成功',
      description: '个人信息已更新',
      type: 'success'
    })
  } catch (error) {
    notificationStore.addNotification({
      title: '更新失败',
      description: '请稍后重试',
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 处理删除账号
const handleDeleteAccount = async () => {
  isDeleting.value = true
  
  try {
    await fetch('/api/users/me', {
      method: 'DELETE'
    })
    
    await userStore.logout()
    router.push('/login')
    
    notificationStore.addNotification({
      title: '账号已删除',
      description: '您的账号已成功删除',
      type: 'success'
    })
  } catch (error) {
    notificationStore.addNotification({
      title: '删除失败',
      description: '请稍后重试',
      type: 'error'
    })
    showDeleteConfirm.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.profile-content {
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 32px;
}

.profile-form {
  margin-bottom: 48px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 60px;
  overflow: hidden;
  cursor: pointer;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  color: white;
  font-size: 48px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  i {
    font-size: 24px;
    color: white;
  }
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.avatar-tip {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.form-group {
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }
}

.input-wrapper {
  position: relative;

  i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--color-text-secondary);
  }

  input,
  textarea {
    width: 100%;
    padding: 8px 12px 8px 40px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: all 0.3s ease;

    &::placeholder {
      color: var(--color-text-placeholder);
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }

    &.error {
      border-color: var(--color-error);
    }
  }

  input {
    height: 40px;
  }

  textarea {
    height: 120px;
    resize: vertical;
    padding-left: 12px;

    & + i {
      top: 12px;
      transform: none;
    }
  }
}

.error-message {
  display: block;
  font-size: 12px;
  color: var(--color-error);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }
}

.btn-secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);

  &:hover:not(:disabled) {
    background-color: var(--color-bg-hover);
  }
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: var(--color-error-dark);
  }
}

.danger-zone {
  padding-top: 32px;
  border-top: 1px solid var(--color-border);

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-error);
    margin-bottom: 16px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  padding: 24px;
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-popup);

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 
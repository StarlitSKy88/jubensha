<template>
  <div class="p-6">
    <el-card class="max-w-3xl mx-auto mb-6" title="安全设置">
      <el-list>
        <el-list-item v-for="item in securitySettings" :key="item.title">
          <template #prefix>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </template>
          <el-list-item-meta
            :title="item.title"
            :description="item.description"
          />
          <template #extra>
            <el-switch
              :model-value="getSettingValue(item.key)"
              @update:model-value="(val) => handleSettingChange(item.key, Boolean(val))"
              :loading="loading"
            />
          </template>
        </el-list-item>
      </el-list>
    </el-card>

    <el-card class="max-w-3xl mx-auto mb-6" title="通知设置">
      <el-list>
        <el-list-item v-for="item in notificationSettings" :key="item.title">
          <template #prefix>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </template>
          <el-list-item-meta
            :title="item.title"
            :description="item.description"
          />
          <template #extra>
            <el-switch
              :model-value="getSettingValue(item.key)"
              @update:model-value="(val) => handleSettingChange(item.key, Boolean(val))"
              :loading="loading"
            />
          </template>
        </el-list-item>
      </el-list>
    </el-card>

    <el-card class="max-w-3xl mx-auto mb-6" title="常规设置">
      <el-list>
        <el-list-item v-for="item in generalSettings" :key="item.title">
          <template #prefix>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </template>
          <el-list-item-meta
            :title="item.title"
            :description="item.description"
          />
          <template #extra>
            <el-switch
              :model-value="getSettingValue(item.key)"
              @update:model-value="(val) => handleSettingChange(item.key, Boolean(val))"
              :loading="loading"
            />
          </template>
        </el-list-item>
      </el-list>
    </el-card>

    <el-card class="max-w-3xl mx-auto mb-6" title="操作日志">
      <activity-log />
    </el-card>

    <el-card class="max-w-3xl mx-auto mb-6" title="危险区域">
      <div class="flex items-center justify-between p-4 bg-red-50 rounded">
        <div>
          <h4 class="text-red-600 font-medium">删除账号</h4>
          <p class="text-gray-600">
            删除账号后，所有数据将被永久删除且无法恢复
          </p>
        </div>
        <el-button
          type="danger"
          @click="showDeleteAccountDialog"
        >
          <template #icon>
            <el-icon><Delete /></el-icon>
          </template>
          删除账号
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="deleteAccountVisible"
      title="删除账号确认"
      width="30%"
      :before-close="hideDeleteAccountDialog"
    >
      <p>请输入密码以确认删除账号：</p>
      <el-input
        v-model="deleteConfirmPassword"
        type="password"
        show-password
        placeholder="请输入密码"
      />
      <p class="mt-4 text-red-600">
        警告：此操作不可逆，您的所有数据将被永久删除！
      </p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="hideDeleteAccountDialog">取消</el-button>
          <el-button
            type="danger"
            @click="handleDeleteAccount"
            :loading="loading"
          >
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lock,
  Bell,
  Setting,
  Delete
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { UpdateProfileParams } from '@/types/user'
import ActivityLog from '@/components/user/ActivityLog.vue'

const authStore = useAuthStore()
const loading = ref(false)
const deleteAccountVisible = ref(false)
const deleteConfirmPassword = ref('')

interface SettingItem {
  title: string
  description: string
  icon: string
  key: keyof NonNullable<UpdateProfileParams['settings']>
}

const getSettingValue = (key: keyof NonNullable<UpdateProfileParams['settings']>): boolean => {
  if (!authStore.user?.settings) return false
  
  if (key === 'language') {
    return authStore.user.settings.language === 'zh-CN'
  }
  if (key === 'theme') {
    return false // theme 设置不使用 switch 组件
  }
  return Boolean(authStore.user.settings[key])
}

const handleSettingChange = async (key: keyof NonNullable<UpdateProfileParams['settings']>, value: boolean) => {
  try {
    loading.value = true
    const updateValue = key === 'language' ? (value ? 'zh-CN' : 'en-US') : value
    await authStore.updateProfile({
      settings: {
        ...authStore.user?.settings,
        [key]: updateValue
      }
    })
    ElMessage.success('设置已更新')
  } catch (error) {
    ElMessage.error('更新失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

const securitySettings = computed<SettingItem[]>(() => [
  {
    title: '两步验证',
    description: '启用两步验证以提高账号安全性',
    icon: 'Lock',
    key: 'twoFactorEnabled'
  }
])

const notificationSettings = computed<SettingItem[]>(() => [
  {
    title: '系统通知',
    description: '接收系统更新、维护等重要通知',
    icon: 'Bell',
    key: 'notifications'
  }
])

const generalSettings = computed<SettingItem[]>(() => [
  {
    title: '语言设置',
    description: '选择您偏好的界面语言',
    icon: 'Setting',
    key: 'language'
  }
])

// 监听用户设置变化
watch(() => authStore.user?.settings, (newSettings) => {
  if (newSettings) {
    // 这里不需要手动更新 settingValues，因为 getSettingValue 已经处理了
  }
}, { deep: true })

const showDeleteAccountDialog = () => {
  deleteAccountVisible.value = true
}

const hideDeleteAccountDialog = () => {
  deleteAccountVisible.value = false
  deleteConfirmPassword.value = ''
}

const handleDeleteAccount = async () => {
  if (!deleteConfirmPassword.value) {
    ElMessage.warning('请输入密码')
    return
  }

  try {
    loading.value = true
    await authStore.deleteAccount(deleteConfirmPassword.value)
    ElMessage.success('账号已删除')
    hideDeleteAccountDialog()
  } catch (error) {
    ElMessage.error('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style> 
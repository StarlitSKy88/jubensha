<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <h2>个人资料</h2>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存修改
          </el-button>
        </div>
      </template>
      
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarUpload"
        >
          <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <span class="upload-tip">点击上传头像</span>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        
        <el-form-item label="所在地" prop="location">
          <el-input v-model="form.location" placeholder="请输入所在地" />
        </el-form-item>
        
        <el-form-item label="个人网站" prop="website">
          <el-input v-model="form.website" placeholder="请输入个人网站" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProfileStore } from '@/stores/profile'
import type { Profile } from '@/types/components'

const profileStore = useProfileStore()
const formRef = ref<FormInstance>()
const saving = ref(false)

const { profile } = storeToRefs(profileStore)

const form = ref<Profile>({
  nickname: '',
  bio: '',
  location: '',
  website: '',
  gender: '',
  birthday: ''
})

const rules: FormRules = {
  nickname: [
    { max: 50, message: '昵称不能超过50个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }
  ],
  website: [
    { type: 'url', message: '请输入正确的网址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  try {
    await profileStore.fetchProfile()
    if (profile.value) {
      form.value = {
        nickname: profile.value.nickname || '',
        bio: profile.value.bio || '',
        location: profile.value.location || '',
        website: profile.value.website || '',
        gender: profile.value.gender || '',
        birthday: profile.value.birthday || ''
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    ElMessage.error('获取个人资料失败')
  }
})

async function handleSave() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    await profileStore.updateProfile(form.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('Failed to save profile:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

async function handleAvatarUpload(options: { file: File }) {
  try {
    await profileStore.uploadAvatar(options.file)
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    ElMessage.error('头像上传失败')
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409eff;
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
}

.upload-tip {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}
</style> 
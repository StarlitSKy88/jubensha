<template>
  <div class="files-container">
    <el-card class="files-card">
      <template #header>
        <div class="files-header">
          <h2>文件管理</h2>
          <el-upload
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
          >
            <el-button type="primary" :loading="uploading">
              上传文件
            </el-button>
          </el-upload>
        </div>
      </template>
      
      <div class="upload-progress" v-if="uploading">
        <el-progress
          :percentage="uploadProgress"
          :format="progressFormat"
          status="success"
        />
      </div>
      
      <el-table
        v-loading="loading"
        :data="files"
        style="width: 100%"
      >
        <el-table-column label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-name">
              <el-icon class="file-icon">
                <Document v-if="isDocument(row.type)" />
                <Picture v-else-if="isImage(row.type)" />
                <VideoPlay v-else-if="isVideo(row.type)" />
                <Folder v-else />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            {{ getFileTypeLabel(row.type) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="size" label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="uploaded_at" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.uploaded_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                link
                @click="handleDownload(row)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Picture, VideoPlay, Folder } from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'
import { useFileStore } from '@/stores/files'
import dayjs from 'dayjs'

const fileStore = useFileStore()
const loading = ref(false)

const { files, uploading, uploadProgress } = storeToRefs(fileStore)

onMounted(async () => {
  try {
    loading.value = true
    await fileStore.fetchFiles()
  } catch (error) {
    console.error('Failed to fetch files:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
})

function beforeUpload(file: File) {
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  return true
}

async function handleUpload(options: UploadRequestOptions) {
  try {
    await fileStore.uploadFile(options.file)
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('Failed to upload file:', error)
    ElMessage.error('上传失败')
  }
}

async function handleDelete(file: any) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个文件吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await fileStore.deleteFile(file.url.replace('/uploads/', ''))
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete file:', error)
      ElMessage.error('删除失败')
    }
  }
}

function handleDownload(file: any) {
  window.open(file.url, '_blank')
}

function progressFormat(percentage: number) {
  return percentage === 100 ? '上传完成' : `${percentage}%`
}

// 文件类型判断
function isDocument(type: string) {
  return /^(text|application\/(pdf|msword|vnd\.openxmlformats))/.test(type)
}

function isImage(type: string) {
  return type.startsWith('image/')
}

function isVideo(type: string) {
  return type.startsWith('video/')
}

// 文件类型标签
function getFileTypeLabel(type: string) {
  if (isDocument(type)) return '文档'
  if (isImage(type)) return '图片'
  if (isVideo(type)) return '视频'
  return '其他'
}

// 文件大小格式化
function formatFileSize(size: number) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

// 日期格式化
function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.files-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
  }
}

.upload-progress {
  margin: 20px 0;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .file-icon {
    font-size: 20px;
  }
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  
  .el-button {
    padding: 4px 8px;
  }
}
</style> 
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FileInfo } from '@/types/components'
import axios from 'axios'

export const useFileStore = defineStore('files', () => {
  const files = ref<FileInfo[]>([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  
  async function fetchFiles() {
    try {
      const response = await axios.get('/api/v1/files')
      files.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch files:', error)
      throw error
    }
  }
  
  async function uploadFile(file: File) {
    try {
      uploading.value = true
      uploadProgress.value = 0
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post('/api/v1/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
        }
      })
      
      files.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }
  
  async function deleteFile(fileId: string) {
    try {
      await axios.delete(`/api/v1/files/${fileId}`)
      files.value = files.value.filter(file => file.url !== `/uploads/${fileId}`)
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }
  
  return {
    files,
    uploading,
    uploadProgress,
    fetchFiles,
    uploadFile,
    deleteFile
  }
}) 
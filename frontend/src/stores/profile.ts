import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Profile, UserSettings } from '@/types/components'
import axios from 'axios'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const settings = ref<UserSettings | null>(null)
  
  async function fetchProfile() {
    try {
      const response = await axios.get('/api/v1/profile')
      profile.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      throw error
    }
  }
  
  async function updateProfile(data: Profile) {
    try {
      const response = await axios.put('/api/v1/profile', data)
      profile.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }
  
  async function uploadAvatar(file: File) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await axios.post('/api/v1/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (profile.value) {
        profile.value.avatar_url = response.data.url
      }
      
      return response.data
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      throw error
    }
  }
  
  async function fetchSettings() {
    try {
      const response = await axios.get('/api/v1/settings')
      settings.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw error
    }
  }
  
  async function updateSettings(data: UserSettings) {
    try {
      const response = await axios.put('/api/v1/settings', data)
      settings.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }
  
  return {
    profile,
    settings,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    fetchSettings,
    updateSettings
  }
}) 
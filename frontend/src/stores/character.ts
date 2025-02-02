import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ICharacter, ICharacterSuggestion } from '@/types/character'
import { request } from '@/utils/request'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref&lt;ICharacter[]&gt;([])
  const loading = ref(false)
  const error = ref&lt;string | null&gt;(null)

  // 获取角色列表
  const getCharacters = async (projectId: string) => {
    try {
      loading.value = true
      const response = await request.get&lt;ICharacter[]&gt;(`/api/characters?projectId=${projectId}`)
      characters.value = response.data
      return response.data
    } catch (err) {
      error.value = '获取角色列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个角色
  const getCharacter = async (id: string) => {
    try {
      loading.value = true
      const response = await request.get&lt;ICharacter&gt;(`/api/characters/${id}`)
      return response.data
    } catch (err) {
      error.value = '获取角色信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建角色
  const createCharacter = async (data: Omit&lt;ICharacter, 'id' | 'createdAt' | 'updatedAt'&gt;) => {
    try {
      loading.value = true
      const response = await request.post&lt;ICharacter&gt;('/api/characters', data)
      characters.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = '创建角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新角色
  const updateCharacter = async (id: string, data: Partial&lt;ICharacter&gt;) => {
    try {
      loading.value = true
      const response = await request.put&lt;ICharacter&gt;(`/api/characters/${id}`, data)
      const index = characters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        characters.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = '更新角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除角色
  const deleteCharacter = async (id: string) => {
    try {
      loading.value = true
      await request.delete(`/api/characters/${id}`)
      const index = characters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        characters.value.splice(index, 1)
      }
      return true
    } catch (err) {
      error.value = '删除角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 分析角色
  const analyzeCharacter = async (id: string) => {
    try {
      loading.value = true
      const response = await request.post&lt;ICharacter&gt;(`/api/characters/${id}/analyze`)
      const index = characters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        characters.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = '分析角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量分析角色
  const batchAnalyzeCharacters = async (ids?: string[]) => {
    try {
      loading.value = true
      const response = await request.post&lt;ICharacter[]&gt;('/api/characters/analyze/batch', { ids })
      characters.value = response.data
      return response.data
    } catch (err) {
      error.value = '批量分析角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 导出角色
  const exportCharacters = async (ids?: string[]) => {
    try {
      loading.value = true
      const response = await request.post('/api/characters/export', { ids }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'characters.json')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = '导出角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 导入角色
  const importCharacters = async (file: File) => {
    try {
      loading.value = true
      const formData = new FormData()
      formData.append('file', file)
      const response = await request.post&lt;ICharacter[]&gt;('/api/characters/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      characters.value = response.data
      return response.data
    } catch (err) {
      error.value = '导入角色失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取角色建议
  const getCharacterSuggestions = async (params: ICharacterSuggestion) => {
    try {
      loading.value = true
      const response = await request.post&lt;ICharacter[]&gt;('/api/characters/suggestions', params)
      return response.data
    } catch (err) {
      error.value = '获取角色建议失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取角色关系
  const getCharacterRelationships = async (characterId: string) => {
    try {
      loading.value = true
      const response = await request.get(`/api/characters/${characterId}/relationships`)
      return response.data
    } catch (err) {
      error.value = '获取角色关系失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 添加角色关系
  const addCharacterRelationship = async (
    characterId: string,
    targetId: string,
    type: string,
    description: string
  ) => {
    try {
      loading.value = true
      const response = await request.post(`/api/characters/${characterId}/relationships`, {
        targetId,
        type,
        description
      })
      return response.data
    } catch (err) {
      error.value = '添加角色关系失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新角色关系
  const updateCharacterRelationship = async (
    characterId: string,
    targetId: string,
    type: string,
    description: string
  ) => {
    try {
      loading.value = true
      const response = await request.put(`/api/characters/${characterId}/relationships/${targetId}`, {
        type,
        description
      })
      return response.data
    } catch (err) {
      error.value = '更新角色关系失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除角色关系
  const deleteCharacterRelationship = async (characterId: string, targetId: string) => {
    try {
      loading.value = true
      await request.delete(`/api/characters/${characterId}/relationships/${targetId}`)
      return true
    } catch (err) {
      error.value = '删除角色关系失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    characters,
    loading,
    error,
    getCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    analyzeCharacter,
    batchAnalyzeCharacters,
    exportCharacters,
    importCharacters,
    getCharacterSuggestions,
    getCharacterRelationships,
    addCharacterRelationship,
    updateCharacterRelationship,
    deleteCharacterRelationship
  }
}) 
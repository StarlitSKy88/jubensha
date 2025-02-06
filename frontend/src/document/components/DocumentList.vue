<template>
  <div class="document-list">
    <div class="document-toolbar">
      <el-button type="primary" @click="createDocument">新建文档</el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索文档"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <el-table :data="documents" style="width: 100%">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column prop="creator" label="创建者" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button @click="editDocument(row)">编辑</el-button>
            <el-button type="danger" @click="deleteDocument(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Document } from '@/types'

const searchQuery = ref('')
const documents = ref<Document[]>([])

const createDocument = () => {
  // TODO: 实现新建文档逻辑
  console.log('新建文档')
}

const editDocument = (doc: Document) => {
  // TODO: 实现编辑文档逻辑
  console.log('编辑文档:', doc)
}

const deleteDocument = (doc: Document) => {
  // TODO: 实现删除文档逻辑
  console.log('删除文档:', doc)
}
</script>

<style scoped>
.document-list {
  padding: 20px;
}

.document-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}
</style> 
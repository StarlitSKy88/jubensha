<template>
  <div class="user-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :router="true"
          :default-active="route.path"
          class="h-full"
        >
          <el-menu-item index="/user/profile">
            <template #title>
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/user/settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { User, Setting } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped>
.user-layout {
  height: 100%;
  background-color: var(--el-bg-color);
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: var(--el-bg-color-overlay);
  border-right: 1px solid var(--el-border-color-light);
}

.el-main {
  padding: 20px;
  background-color: var(--el-bg-color-page);
}
</style> 
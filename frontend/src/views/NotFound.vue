<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1 class="title">页面未找到</h1>
      <p class="description">抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="icon-arrow-left"></i>
          返回上一页
        </button>
        <router-link to="/" class="btn btn-primary">
          <i class="icon-home"></i>
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: var(--color-bg-secondary);
}

.content {
  text-align: center;
  max-width: 480px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
  margin-bottom: 24px;
  text-shadow: 4px 4px 0 var(--color-primary-light);
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.description {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  i {
    margin-right: 8px;
    font-size: 16px;
  }

  &.btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;

    &:hover {
      background-color: var(--color-primary-dark);
    }
  }

  &.btn-secondary {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);

    &:hover {
      background-color: var(--color-bg-hover);
    }
  }
}
</style> 
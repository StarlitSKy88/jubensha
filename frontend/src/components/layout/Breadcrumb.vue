<template>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol>
      <li 
        v-for="(item, index) in items" 
        :key="item.path"
        :class="{ active: index === items.length - 1 }"
      >
        <router-link 
          v-if="index !== items.length - 1" 
          :to="item.path"
        >
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
interface BreadcrumbItem {
  title: string
  path: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style lang="scss" scoped>
.breadcrumb {
  ol {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    font-size: 14px;

    &:not(:last-child)::after {
      content: '/';
      margin: 0 8px;
      color: var(--color-text-placeholder);
    }

    &.active {
      color: var(--color-text-primary);
    }

    a {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
</style> 
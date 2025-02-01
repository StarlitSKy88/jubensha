<template>
  <el-dialog
    v-model="dialogVisible"
    title="快捷键帮助"
    width="500px"
  >
    <div class="shortcut-help">
      <el-table :data="shortcuts" :show-header="false">
        <el-table-column prop="description" label="功能" width="200">
          <template #default="{ row }">
            <span class="shortcut-description">{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="shortcut" label="快捷键">
          <template #default="{ row }">
            <div class="shortcut-keys">
              <template v-for="(key, index) in getShortcutKeys(row)" :key="index">
                <kbd class="key">{{ key }}</kbd>
                <span v-if="index < getShortcutKeys(row).length - 1" class="separator">+</span>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="tip">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            按 <kbd class="key">Ctrl</kbd> + <kbd class="key">?</kbd> 可以随时打开此帮助
          </template>
        </el-alert>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { KeyboardShortcut } from '@/utils/keyboardManager'

const props = defineProps<{
  visible: boolean
  shortcuts: KeyboardShortcut[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

function getShortcutKeys(shortcut: KeyboardShortcut): string[] {
  const keys: string[] = []
  
  if (shortcut.ctrl) keys.push('Ctrl')
  if (shortcut.shift) keys.push('Shift')
  if (shortcut.alt) keys.push('Alt')
  if (shortcut.meta) keys.push('Meta')
  
  keys.push(shortcut.key.toUpperCase())
  
  return keys
}
</script>

<style scoped lang="scss">
.shortcut-help {
  .shortcut-description {
    font-size: 14px;
    color: #606266;
  }
  
  .shortcut-keys {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .key {
      display: inline-block;
      padding: 3px 6px;
      font-size: 12px;
      line-height: 1;
      color: #606266;
      background: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      box-shadow: 0 2px 0 #dcdfe6;
    }
    
    .separator {
      color: #909399;
    }
  }
  
  .tip {
    margin-top: 20px;
    
    :deep(.el-alert__title) {
      font-size: 14px;
      line-height: 1.6;
      
      .key {
        display: inline-block;
        padding: 2px 4px;
        font-size: 12px;
        line-height: 1;
        color: #606266;
        background: #f5f7fa;
        border: 1px solid #dcdfe6;
        border-radius: 3px;
        box-shadow: 0 2px 0 #dcdfe6;
      }
    }
  }
}
</style> 
<template>
  <el-dialog
    v-model="dialogVisible"
    title="快捷键帮助"
    width="600px"
  >
    <div class="shortcut-help">
      <!-- 分类标签页 -->
      <el-tabs v-model="activeCategory">
        <el-tab-pane
          v-for="category in categories"
          :key="category"
          :label="category"
          :name="category"
        >
          <el-table :data="getShortcutsByCategory(category)" :show-header="true">
            <el-table-column prop="description" label="功能" width="150">
              <template #default="{ row }">
                <span class="shortcut-description">{{ row.description }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="shortcut" label="快捷键" width="200">
              <template #default="{ row }">
                <div class="shortcut-keys">
                  <template v-if="customizing === row.id">
                    <el-button
                      size="small"
                      @click="startRecording(row)"
                      :loading="recording"
                    >
                      {{ recording ? '请按下快捷键...' : '点击设置' }}
                    </el-button>
                  </template>
                  <template v-else>
                    <template v-for="(key, index) in getShortcutKeys(row)" :key="index">
                      <kbd class="key">{{ key }}</kbd>
                      <span v-if="index < getShortcutKeys(row).length - 1" class="separator">+</span>
                    </template>
                  </template>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <template v-if="row.isDefault">
                  <el-button
                    v-if="customizing !== row.id"
                    type="text"
                    @click="customizing = row.id"
                  >
                    自定义
                  </el-button>
                  <el-button
                    v-else
                    type="text"
                    @click="cancelCustomize"
                  >
                    取消
                  </el-button>
                  <el-button
                    v-if="isCustomized(row)"
                    type="text"
                    @click="resetShortcut(row)"
                  >
                    重置
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

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
import { getShortcutDescription } from '@/utils/keyboardManager'

const props = defineProps<{
  visible: boolean
  shortcuts: KeyboardShortcut[]
  keyboardManager: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'shortcutChange', shortcut: KeyboardShortcut): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 分类相关
const activeCategory = ref('编辑')
const categories = computed(() => {
  const cats = new Set(props.shortcuts.map(s => s.category))
  return Array.from(cats).filter(Boolean)
})

const getShortcutsByCategory = (category: string) => {
  return props.shortcuts.filter(s => s.category === category)
}

// 自定义快捷键相关
const customizing = ref<string | null>(null)
const recording = ref(false)

function getShortcutKeys(shortcut: KeyboardShortcut): string[] {
  return getShortcutDescription(shortcut).split('+')
}

function isCustomized(shortcut: KeyboardShortcut): boolean {
  return props.keyboardManager.customShortcuts.has(shortcut.id)
}

function startRecording(shortcut: KeyboardShortcut) {
  recording.value = true
  
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault()
    
    const newShortcut: Partial<KeyboardShortcut> = {
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey
    }
    
    try {
      props.keyboardManager.customizeShortcut(shortcut.id!, newShortcut)
      emit('shortcutChange', shortcut)
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    }
    
    recording.value = false
    customizing.value = null
    window.removeEventListener('keydown', handleKeyDown)
  }
  
  window.addEventListener('keydown', handleKeyDown)
}

function cancelCustomize() {
  recording.value = false
  customizing.value = null
}

function resetShortcut(shortcut: KeyboardShortcut) {
  props.keyboardManager.resetShortcut(shortcut.id!)
  emit('shortcutChange', shortcut)
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
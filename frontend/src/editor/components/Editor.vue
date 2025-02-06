<template>
  <div class="editor-container">
    <div class="editor-toolbar">
      <el-button-group>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="undo">撤销</el-button>
        <el-button @click="redo">重做</el-button>
      </el-button-group>
    </div>
    <div class="editor-content" ref="editorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editorRef = ref<HTMLElement | null>(null)
const editor = ref<Editor | null>(null)

// 初始化编辑器
onMounted(() => {
  if (editorRef.value) {
    editor.value = new Editor({
      element: editorRef.value,
      extensions: [
        StarterKit,
      ],
      content: '',
      autofocus: true,
    })
  }
})

// 销毁编辑器
onUnmounted(() => {
  editor.value?.destroy()
})

// 编辑器方法
const save = () => {
  const content = editor.value?.getHTML()
  // TODO: 实现保存逻辑
  console.log('保存内容:', content)
}

const undo = () => {
  editor.value?.commands.undo()
}

const redo = () => {
  editor.value?.commands.redo()
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid #dcdfe6;
}

.editor-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style> 
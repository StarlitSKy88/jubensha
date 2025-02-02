<template>
  <div class="relationship-graph">
    <div class="toolbar">
      <el-button-group>
        <el-button @click="zoomIn">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button @click="zoomOut">
          <el-icon><ZoomOut /></el-icon>
        </el-button>
        <el-button @click="resetZoom">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="autoLayout">
          <el-icon><Refresh /></el-icon>自动布局
        </el-button>
        <el-button @click="exportImage">
          <el-icon><Download /></el-icon>导出图片
        </el-button>
      </el-button-group>

      <el-select
        v-model="layoutType"
        placeholder="布局类型"
        @change="changeLayout"
      >
        <el-option label="力导向布局" value="force" />
        <el-option label="环形布局" value="circular" />
        <el-option label="树形布局" value="tree" />
      </el-select>
    </div>

    <div class="graph-container" ref="graphContainer"></div>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑关系"
      width="30%"
    >
      <el-form
        ref="formRef"
        :model="relationshipForm"
        label-width="80px"
      >
        <el-form-item label="关系类型">
          <el-select v-model="relationshipForm.type" placeholder="选择关系类型">
            <el-option
              v-for="type in relationshipTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="relationshipForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRelationship">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ZoomIn,
  ZoomOut,
  FullScreen,
  Refresh,
  Download
} from '@element-plus/icons-vue'
import G6 from '@antv/g6'
import type { Graph, GraphData } from '@antv/g6'
import type { Character } from '@/types/character'

const props = defineProps<{
  characters: Character[]
  relationships: Array<{
    id: string
    sourceId: string
    targetId: string
    type: string
    description: string
  }>
}>()

const emit = defineEmits<{
  (e: 'edit-relationship', sourceId: string, targetId: string, type: string): void
}>()

// 状态
const graphContainer = ref<HTMLElement>()
const graph = ref<Graph>()
const layoutType = ref('force')
const editDialogVisible = ref(false)
const relationshipForm = ref({
  sourceId: '',
  targetId: '',
  type: '',
  description: ''
})

// 常量
const relationshipTypes = [
  { label: '亲属', value: 'family' },
  { label: '朋友', value: 'friend' },
  { label: '敌人', value: 'enemy' },
  { label: '恋人', value: 'lover' },
  { label: '师徒', value: 'mentor' },
  { label: '同事', value: 'colleague' },
  { label: '上下级', value: 'superior' }
]

const relationshipColors = {
  family: '#FF9900',
  friend: '#2ECC71',
  enemy: '#E74C3C',
  lover: '#E91E63',
  mentor: '#9B59B6',
  colleague: '#3498DB',
  superior: '#34495E'
}

// 初始化图谱
const initGraph = () => {
  if (!graphContainer.value) return

  const width = graphContainer.value.scrollWidth
  const height = graphContainer.value.scrollHeight || 500

  graph.value = new G6.Graph({
    container: graphContainer.value,
    width,
    height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    },
    layout: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 200,
      nodeStrength: -100,
      edgeStrength: 0.1
    },
    defaultNode: {
      size: 40,
      style: {
        fill: '#fff',
        stroke: '#666',
        lineWidth: 2,
        shadowColor: '#999',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      labelCfg: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    },
    defaultEdge: {
      style: {
        stroke: '#999',
        lineWidth: 2,
        endArrow: {
          path: G6.Arrow.triangle(8, 8, 0),
          fill: '#999'
        }
      },
      labelCfg: {
        style: {
          fill: '#666',
          fontSize: 12
        }
      }
    }
  })

  // 注册交互行为
  graph.value.on('edge:click', (evt) => {
    const edge = evt.item
    if (!edge) return

    const model = edge.getModel()
    relationshipForm.value = {
      sourceId: model.source as string,
      targetId: model.target as string,
      type: model.type as string,
      description: model.description as string
    }
    editDialogVisible.value = true
  })

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图谱数据
const updateGraphData = () => {
  if (!graph.value) return

  const data: GraphData = {
    nodes: props.characters.map(char => ({
      id: char.id,
      label: char.name,
      style: {
        fill: char.role === 'protagonist' ? '#E3F2FD' :
              char.role === 'antagonist' ? '#FFEBEE' : '#F5F5F5'
      }
    })),
    edges: props.relationships.map(rel => ({
      source: rel.sourceId,
      target: rel.targetId,
      label: rel.type,
      type: rel.type,
      description: rel.description,
      style: {
        stroke: relationshipColors[rel.type as keyof typeof relationshipColors] || '#999'
      }
    }))
  }

  graph.value.data(data)
  graph.value.render()
}

// 布局相关
const changeLayout = () => {
  if (!graph.value) return

  const layouts = {
    force: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 200,
      nodeStrength: -100,
      edgeStrength: 0.1
    },
    circular: {
      type: 'circular',
      preventOverlap: true,
      radius: 200
    },
    tree: {
      type: 'dendrogram',
      direction: 'LR',
      nodeSep: 50,
      rankSep: 100
    }
  }

  graph.value.updateLayout(layouts[layoutType.value as keyof typeof layouts])
}

const autoLayout = () => {
  if (!graph.value) return
  graph.value.layout()
}

// 缩放相关
const zoomIn = () => {
  if (!graph.value) return
  const current = graph.value.getZoom()
  graph.value.zoomTo(current * 1.2)
}

const zoomOut = () => {
  if (!graph.value) return
  const current = graph.value.getZoom()
  graph.value.zoomTo(current / 1.2)
}

const resetZoom = () => {
  if (!graph.value) return
  graph.value.fitView()
}

// 导出图片
const exportImage = () => {
  if (!graph.value) return
  graph.value.downloadFullImage('character-relationships', 'image/png', {
    backgroundColor: '#fff'
  })
}

// 关系编辑
const saveRelationship = () => {
  emit(
    'edit-relationship',
    relationshipForm.value.sourceId,
    relationshipForm.value.targetId,
    relationshipForm.value.type
  )
  editDialogVisible.value = false
}

// 窗口大小变化处理
const handleResize = () => {
  if (!graphContainer.value || !graph.value) return
  const width = graphContainer.value.scrollWidth
  const height = graphContainer.value.scrollHeight || 500
  graph.value.changeSize(width, height)
}

// 生命周期
onMounted(() => {
  initGraph()
  updateGraphData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  graph.value?.destroy()
})

// 监听数据变化
watch(
  () => [props.characters, props.relationships],
  () => {
    updateGraphData()
  },
  { deep: true }
)
</script>

<style scoped>
.relationship-graph {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.graph-container {
  flex: 1;
  min-height: 500px;
  background-color: #fafafa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
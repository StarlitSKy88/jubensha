<template>
  <div class="project-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        创建项目
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索项目"
        class="search-input"
        clearable
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 项目列表 -->
    <el-row :gutter="20" class="project-grid">
      <el-col 
        v-for="project in projects" 
        :key="project.id" 
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
      >
        <el-card class="project-card" :body-style="{ padding: '0px' }">
          <!-- 项目封面 -->
          <div class="cover">
            <img :src="project.cover || '/default-cover.jpg'" alt="项目封面">
          </div>
          
          <!-- 项目信息 -->
          <div class="info">
            <h3 class="title">{{ project.title }}</h3>
            <p class="description">{{ project.description }}</p>
            <div class="meta">
              <span class="time">
                <el-icon><Clock /></el-icon>
                {{ formatDate(project.updatedAt) }}
              </span>
              <span class="status" :class="project.status">
                {{ project.status === 'draft' ? '草稿' : '已发布' }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <el-button-group>
              <el-button 
                type="primary" 
                :icon="Edit"
                @click="handleEdit(project)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                :icon="Delete"
                @click="handleDelete(project)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建项目' : '编辑项目'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            class="cover-upload"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="form.cover" :src="form.cover" class="preview">
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除确认"
      width="300px"
    >
      <p>确定要删除该项目吗？此操作不可恢复。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Edit, Delete, Clock, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  type Project 
} from '@/api/project'
import { formatDate } from '@/utils/date'

// 状态
const projects = ref<Project[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const deleteDialogVisible = ref(false)
const currentProject = ref<Project | null>(null)

// 表单
const formRef = ref<FormInstance>()
const form = ref({
  title: '',
  description: '',
  cover: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const { items, total: totalCount } = await getProjects({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    projects.value = items
    total.value = totalCount
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  }
}

// 创建项目
const handleCreate = () => {
  dialogType.value = 'create'
  form.value = {
    title: '',
    description: '',
    cover: ''
  }
  dialogVisible.value = true
}

// 编辑项目
const handleEdit = (project: Project) => {
  dialogType.value = 'edit'
  currentProject.value = project
  form.value = {
    title: project.title,
    description: project.description,
    cover: project.cover || ''
  }
  dialogVisible.value = true
}

// 删除项目
const handleDelete = (project: Project) => {
  currentProject.value = project
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentProject.value) return
  
  try {
    await deleteProject(currentProject.value.id)
    ElMessage.success('删除成功')
    loadProjects()
  } catch (error) {
    ElMessage.error('删除失败')
  }
  deleteDialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'create') {
          await createProject(form.value)
          ElMessage.success('创建成功')
        } else {
          if (!currentProject.value) return
          await updateProject({
            id: currentProject.value.id,
            ...form.value
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        loadProjects()
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      }
    }
  })
}

// 上传相关
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any) => {
  form.value.cover = response.url
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadProjects()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadProjects()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadProjects()
}

// 初始化
onMounted(() => {
  loadProjects()
})
</script>

<style scoped lang="scss">
.project-list {
  padding: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .search-input {
      width: 300px;
    }
  }

  .project-grid {
    margin-bottom: 20px;
  }

  .project-card {
    margin-bottom: 20px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    }

    .cover {
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      padding: 14px;

      .title {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }

      .description {
        margin: 10px 0;
        font-size: 14px;
        color: #666;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #999;

        .time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status {
          padding: 2px 6px;
          border-radius: 10px;
          
          &.draft {
            background: #f0f0f0;
          }
          
          &.published {
            background: #e1f3d8;
            color: #67c23a;
          }
        }
      }
    }

    .actions {
      padding: 10px 14px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .cover-upload {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    .preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style> 
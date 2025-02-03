<template>
  <div class="event-editor-page">
    <div class="page-header">
      <h1>{{ isEdit ? '编辑事件' : '创建新事件' }}</h1>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="event-form"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入事件标题" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入事件描述"
        />
      </el-form-item>

      <el-form-item label="日期时间" prop="date">
        <el-date-picker
          v-model="form.date"
          type="datetime"
          placeholder="选择日期和时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="地点" prop="location">
        <el-input v-model="form.location" placeholder="请输入事件发生地点" />
      </el-form-item>

      <el-form-item label="重要性" prop="importance">
        <el-rate
          v-model="form.importance"
          :max="5"
          :texts="['低', '较低', '中等', '较高', '高']"
          show-text
        />
      </el-form-item>

      <el-form-item label="相关角色" prop="characters">
        <el-select
          v-model="form.characters"
          multiple
          filterable
          placeholder="请选择相关角色"
        >
          <el-option
            v-for="character in characters"
            :key="character.id"
            :label="character.name"
            :value="character.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请输入或选择标签"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="公开性" prop="isPublic">
        <el-switch
          v-model="form.isPublic"
          :active-text="'公开'"
          :inactive-text="'私密'"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import type { FormInstance, FormRules } from 'element-plus';

interface Character {
  id: string;
  name: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  importance: number;
  characters: string[];
  tags?: string[];
  isPublic: boolean;
}

interface EventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  importance: number;
  characters: string[];
  tags: string[];
  isPublic: boolean;
}

export default defineComponent({
  name: 'TimelineEventEditorView',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormInstance>();
    const scriptId = route.params.id as string;
    const eventId = route.params.eventId as string;
    const isEdit = computed(() => !!eventId);
    const saving = ref(false);

    const characters = ref<Character[]>([]);
    const availableTags = ref<string[]>([]);

    const form = ref<EventForm>({
      title: '',
      description: '',
      date: '',
      location: '',
      importance: 3,
      characters: [],
      tags: [],
      isPublic: true
    });

    const rules: FormRules = {
      title: [
        { required: true, message: '请输入事件标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度应在 2 到 100 个字符之间', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入事件描述', trigger: 'blur' },
        { min: 10, max: 2000, message: '描述长度应在 10 到 2000 个字符之间', trigger: 'blur' }
      ],
      date: [
        { required: true, message: '请选择事件日期和时间', trigger: 'change' }
      ],
      importance: [
        { required: true, message: '请选择事件重要性', trigger: 'change' }
      ],
      characters: [
        { required: true, message: '请选择至少一个相关角色', trigger: 'change' }
      ]
    };

    onMounted(async () => {
      await Promise.all([
        loadCharacters(),
        loadAvailableTags(),
        isEdit.value && loadEvent()
      ]);
    });

    const loadCharacters = async () => {
      try {
        const response = await axios.get(`/api/scripts/${scriptId}/characters`);
        characters.value = response.data.data;
      } catch (error) {
        console.error('加载角色列表失败:', error);
        ElMessage.error('加载角色列表失败');
      }
    };

    const loadAvailableTags = async () => {
      try {
        const response = await axios.get(`/api/scripts/${scriptId}/events/tags`);
        availableTags.value = response.data.data;
      } catch (error) {
        console.error('加载标签列表失败:', error);
      }
    };

    const loadEvent = async () => {
      try {
        const response = await axios.get(`/api/scripts/${scriptId}/events/${eventId}`);
        const event = response.data.data;
        form.value = {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location || '',
          importance: event.importance,
          characters: event.characters,
          tags: event.tags || [],
          isPublic: event.isPublic
        };
      } catch (error) {
        console.error('加载事件信息失败:', error);
        ElMessage.error('加载事件信息失败');
        router.push(`/scripts/${scriptId}/timeline`);
      }
    };

    const handleSave = async () => {
      if (!formRef.value) return;

      try {
        await formRef.value.validate();
        saving.value = true;

        const data = {
          ...form.value,
          location: form.value.location || undefined,
          tags: form.value.tags.length ? form.value.tags : undefined
        };

        if (isEdit.value) {
          await axios.put(`/api/scripts/${scriptId}/events/${eventId}`, data);
          ElMessage.success('事件更新成功');
        } else {
          await axios.post(`/api/scripts/${scriptId}/events`, data);
          ElMessage.success('事件创建成功');
        }

        router.push(`/scripts/${scriptId}/timeline`);
      } catch (error) {
        if (error instanceof Error) {
          ElMessage.error(error.message);
        } else {
          console.error('保存事件失败:', error);
          ElMessage.error('保存事件失败');
        }
      } finally {
        saving.value = false;
      }
    };

    const handleCancel = () => {
      router.push(`/scripts/${scriptId}/timeline`);
    };

    return {
      formRef,
      form,
      rules,
      isEdit,
      saving,
      characters,
      availableTags,
      handleSave,
      handleCancel
    };
  }
});
</script>

<style scoped>
.event-editor-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.event-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

:deep(.el-rate__text) {
  margin-left: 10px;
  font-size: 14px;
}

:deep(.el-select) {
  width: 100%;
}
</style> 
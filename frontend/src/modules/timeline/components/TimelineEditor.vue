<template>
  <div class="timeline-editor">
    <div class="editor-header">
      <h2>{{ isEdit ? '编辑时间线事件' : '创建时间线事件' }}</h2>
      <div class="header-actions">
        <button 
          class="btn-save" 
          :disabled="loading || !isFormValid" 
          @click="handleSave"
        >
          {{ loading ? '保存中...' : '保存' }}
        </button>
        <button class="btn-cancel" @click="handleCancel">取消</button>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="editor-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3>基本信息</h3>
        <div class="form-group">
          <label for="title">事件标题 *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            :class="{ 'error': errors.title }"
            @input="clearError('title')"
          >
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>

        <div class="form-group">
          <label for="description">事件描述 *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            :class="{ 'error': errors.description }"
            @input="clearError('description')"
          ></textarea>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">事件日期 *</label>
            <input
              id="date"
              v-model="form.date"
              type="datetime-local"
              required
              :class="{ 'error': errors.date }"
              @input="clearError('date')"
            >
            <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
          </div>

          <div class="form-group">
            <label for="location">地点</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              :class="{ 'error': errors.location }"
              @input="clearError('location')"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="importance">重要性</label>
          <select
            id="importance"
            v-model="form.importance"
            :class="{ 'error': errors.importance }"
            @change="clearError('importance')"
          >
            <option value="1">低</option>
            <option value="2">较低</option>
            <option value="3">中等</option>
            <option value="4">较高</option>
            <option value="5">高</option>
          </select>
        </div>
      </div>

      <!-- 相关角色 -->
      <div class="form-section">
        <h3>相关角色</h3>
        <div class="form-group">
          <div class="selected-characters">
            <div
              v-for="character in selectedCharacters"
              :key="character.id"
              class="character-tag"
            >
              {{ character.name }}
              <button type="button" @click="removeCharacter(character.id)">&times;</button>
            </div>
          </div>
          <div class="character-selector">
            <select
              v-model="selectedCharacterId"
              @change="addCharacter"
            >
              <option value="">选择角色...</option>
              <option
                v-for="character in availableCharacters"
                :key="character.id"
                :value="character.id"
              >
                {{ character.name }}
              </option>
            </select>
          </div>
          <span v-if="errors.characters" class="error-message">{{ errors.characters }}</span>
        </div>
      </div>

      <!-- 标签 -->
      <div class="form-section">
        <h3>标签</h3>
        <div class="form-group">
          <div class="tags">
            <div
              v-for="tag in form.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
              <button type="button" @click="removeTag(tag)">&times;</button>
            </div>
          </div>
          <div class="add-tag">
            <input
              v-model="newTag"
              type="text"
              placeholder="添加标签"
              @keyup.enter="addTag"
            >
            <button type="button" @click="addTag">添加</button>
          </div>
        </div>
      </div>

      <!-- 相关事件 -->
      <div class="form-section">
        <h3>相关事件</h3>
        <div class="form-group">
          <div class="related-events">
            <div
              v-for="event in selectedRelatedEvents"
              :key="event.id"
              class="event-tag"
            >
              {{ event.title }}
              <button type="button" @click="removeRelatedEvent(event.id)">&times;</button>
            </div>
          </div>
          <div class="event-selector">
            <select
              v-model="selectedEventId"
              @change="addRelatedEvent"
            >
              <option value="">选择相关事件...</option>
              <option
                v-for="event in availableEvents"
                :key="event.id"
                :value="event.id"
              >
                {{ event.title }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 可见性设置 -->
      <div class="form-section">
        <h3>可见性设置</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.isPublic"
            >
            公开此事件（其他用户可以查看）
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface TimelineForm {
  title: string;
  description: string;
  date: string;
  characters: string[];
  location?: string;
  importance: number;
  tags: string[];
  relatedEvents: string[];
  isPublic: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  characters?: string;
  location?: string;
  importance?: string;
}

interface Character {
  id: string;
  name: string;
}

interface TimelineEvent {
  id: string;
  title: string;
}

export default defineComponent({
  name: 'TimelineEditor',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const projectId = route.params.projectId as string;
    const eventId = route.params.id as string;
    const isEdit = computed(() => !!eventId);

    const form = ref<TimelineForm>({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      characters: [],
      location: '',
      importance: 3,
      tags: [],
      relatedEvents: [],
      isPublic: false
    });

    const errors = ref<FormErrors>({});
    const loading = ref(false);
    const newTag = ref('');
    const selectedCharacterId = ref('');
    const selectedEventId = ref('');
    const availableCharacters = ref<Character[]>([]);
    const availableEvents = ref<TimelineEvent[]>([]);

    const selectedCharacters = computed(() => {
      return availableCharacters.value.filter(c => form.value.characters.includes(c.id));
    });

    const selectedRelatedEvents = computed(() => {
      return availableEvents.value.filter(e => form.value.relatedEvents.includes(e.id));
    });

    const isFormValid = computed(() => {
      return form.value.title.trim() !== '' && 
             form.value.description.trim() !== '' &&
             form.value.date !== '' &&
             form.value.characters.length > 0 &&
             Object.keys(errors.value).length === 0;
    });

    // 如果是编辑模式，加载事件数据
    onMounted(async () => {
      await Promise.all([
        loadCharacters(),
        loadEvents()
      ]);

      if (isEdit.value) {
        await loadEventData();
      }
    });

    const loadCharacters = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/characters`);
        availableCharacters.value = response.data.data;
      } catch (error) {
        console.error('加载角色列表失败:', error);
      }
    };

    const loadEvents = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/events`);
        availableEvents.value = response.data.data.filter((e: TimelineEvent) => e.id !== eventId);
      } catch (error) {
        console.error('加载事件列表失败:', error);
      }
    };

    const loadEventData = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`/api/projects/${projectId}/events/${eventId}`);
        const event = response.data.data;
        Object.assign(form.value, {
          ...event,
          date: new Date(event.date).toISOString().slice(0, 16)
        });
      } catch (error) {
        console.error('加载事件数据失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const validateForm = (): boolean => {
      errors.value = {};
      let isValid = true;

      if (!form.value.title.trim()) {
        errors.value.title = '请输入事件标题';
        isValid = false;
      }

      if (!form.value.description.trim()) {
        errors.value.description = '请输入事件描述';
        isValid = false;
      }

      if (!form.value.date) {
        errors.value.date = '请选择事件日期';
        isValid = false;
      }

      if (form.value.characters.length === 0) {
        errors.value.characters = '请选择至少一个相关角色';
        isValid = false;
      }

      return isValid;
    };

    const clearError = (field: keyof FormErrors) => {
      if (field in errors.value) {
        delete errors.value[field];
      }
    };

    const addCharacter = () => {
      if (selectedCharacterId.value && !form.value.characters.includes(selectedCharacterId.value)) {
        form.value.characters.push(selectedCharacterId.value);
        selectedCharacterId.value = '';
        clearError('characters');
      }
    };

    const removeCharacter = (characterId: string) => {
      form.value.characters = form.value.characters.filter(id => id !== characterId);
    };

    const addTag = () => {
      const tag = newTag.value.trim();
      if (tag && !form.value.tags.includes(tag)) {
        form.value.tags.push(tag);
        newTag.value = '';
      }
    };

    const removeTag = (tag: string) => {
      form.value.tags = form.value.tags.filter(t => t !== tag);
    };

    const addRelatedEvent = () => {
      if (selectedEventId.value && !form.value.relatedEvents.includes(selectedEventId.value)) {
        form.value.relatedEvents.push(selectedEventId.value);
        selectedEventId.value = '';
      }
    };

    const removeRelatedEvent = (eventId: string) => {
      form.value.relatedEvents = form.value.relatedEvents.filter(id => id !== eventId);
    };

    const handleSave = async () => {
      if (!validateForm()) return;

      loading.value = true;
      try {
        const data = {
          ...form.value,
          date: new Date(form.value.date).toISOString()
        };

        if (isEdit.value) {
          await axios.put(`/api/projects/${projectId}/events/${eventId}`, data);
        } else {
          await axios.post(`/api/projects/${projectId}/events`, data);
        }
        router.push(`/projects/${projectId}/timeline`);
      } catch (error) {
        console.error('保存事件失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = () => {
      router.push(`/projects/${projectId}/timeline`);
    };

    return {
      isEdit,
      form,
      errors,
      loading,
      newTag,
      selectedCharacterId,
      selectedEventId,
      availableCharacters,
      availableEvents,
      selectedCharacters,
      selectedRelatedEvents,
      isFormValid,
      clearError,
      addCharacter,
      removeCharacter,
      addTag,
      removeTag,
      addRelatedEvent,
      removeRelatedEvent,
      handleSave,
      handleCancel
    };
  }
});
</script>

<style scoped>
.timeline-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.error, textarea.error, select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.selected-characters, .related-events, .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.character-tag, .event-tag, .tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.875rem;
}

.character-selector, .event-selector, .add-tag {
  display: flex;
  gap: 0.5rem;
}

.character-selector select, .event-selector select {
  flex: 1;
}

.add-tag input {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

button[type="button"] {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  background: #6c757d;
  color: white;
}
</style> 
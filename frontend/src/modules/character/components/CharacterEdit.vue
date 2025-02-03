<template>
  <div class="character-edit">
    <div class="edit-header">
      <h2>{{ isEdit ? '编辑角色' : '创建角色' }}</h2>
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

    <form @submit.prevent="handleSave" class="edit-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3>基本信息</h3>
        <div class="form-group">
          <label for="name">角色名称 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :class="{ 'error': errors.name }"
            @input="clearError('name')"
          >
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="description">角色描述 *</label>
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
          <div class="form-group half">
            <label for="age">年龄</label>
            <input
              id="age"
              v-model.number="form.age"
              type="number"
              min="0"
              :class="{ 'error': errors.age }"
              @input="clearError('age')"
            >
            <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
          </div>

          <div class="form-group half">
            <label for="gender">性别</label>
            <input
              id="gender"
              v-model="form.gender"
              type="text"
              :class="{ 'error': errors.gender }"
              @input="clearError('gender')"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="occupation">职业</label>
          <input
            id="occupation"
            v-model="form.occupation"
            type="text"
            :class="{ 'error': errors.occupation }"
            @input="clearError('occupation')"
          >
        </div>
      </div>

      <!-- 性格特征 -->
      <div class="form-section">
        <h3>性格特征</h3>
        <div class="form-group">
          <div class="personality-tags">
            <div
              v-for="trait in form.personality"
              :key="trait"
              class="personality-tag"
            >
              {{ trait }}
              <button type="button" @click="removePersonality(trait)">&times;</button>
            </div>
          </div>
          <div class="add-personality">
            <input
              v-model="newPersonality"
              type="text"
              placeholder="添加性格特征"
              @keyup.enter="addPersonality"
            >
            <button type="button" @click="addPersonality">添加</button>
          </div>
        </div>
      </div>

      <!-- 背景故事 -->
      <div class="form-section">
        <h3>背景故事</h3>
        <div class="form-group">
          <textarea
            v-model="form.background"
            rows="6"
            placeholder="描述角色的背景故事..."
            :class="{ 'error': errors.background }"
            @input="clearError('background')"
          ></textarea>
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

      <!-- 可见性设置 -->
      <div class="form-section">
        <h3>可见性设置</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.isPublic"
            >
            公开此角色（其他用户可以查看）
          </label>
        </div>
      </div>
    </form>

    <!-- AI 分析建议 -->
    <div v-if="aiSuggestions" class="ai-suggestions">
      <h3>AI 分析建议</h3>
      <div class="suggestion-content">
        {{ aiSuggestions }}
      </div>
      <button 
        class="btn-analyze" 
        :disabled="!isFormValid || analyzingAI"
        @click="analyzeCharacter"
      >
        {{ analyzingAI ? '分析中...' : '获取AI建议' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface CharacterForm {
  name: string;
  description: string;
  age?: number;
  gender?: string;
  occupation?: string;
  personality: string[];
  background?: string;
  tags: string[];
  isPublic: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  age?: string;
  gender?: string;
  occupation?: string;
  background?: string;
}

export default defineComponent({
  name: 'CharacterEdit',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const characterId = route.params.id as string;
    const isEdit = computed(() => !!characterId);

    const form = ref<CharacterForm>({
      name: '',
      description: '',
      age: undefined,
      gender: '',
      occupation: '',
      personality: [],
      background: '',
      tags: [],
      isPublic: false
    });

    const errors = ref<FormErrors>({});
    const loading = ref(false);
    const newPersonality = ref('');
    const newTag = ref('');
    const aiSuggestions = ref('');
    const analyzingAI = ref(false);

    const isFormValid = computed(() => {
      return form.value.name.trim() !== '' && 
             form.value.description.trim() !== '' &&
             Object.keys(errors.value).length === 0;
    });

    // 如果是编辑模式，加载角色数据
    onMounted(async () => {
      if (isEdit.value) {
        try {
          loading.value = true;
          const response = await axios.get(`/api/characters/${characterId}`);
          const character = response.data.data;
          Object.assign(form.value, character);
        } catch (error) {
          console.error('加载角色数据失败:', error);
        } finally {
          loading.value = false;
        }
      }
    });

    const validateForm = (): boolean => {
      errors.value = {};
      let isValid = true;

      if (!form.value.name.trim()) {
        errors.value.name = '请输入角色名称';
        isValid = false;
      }

      if (!form.value.description.trim()) {
        errors.value.description = '请输入角色描述';
        isValid = false;
      }

      if (form.value.age !== undefined && form.value.age < 0) {
        errors.value.age = '年龄不能小于0';
        isValid = false;
      }

      return isValid;
    };

    const clearError = (field: keyof FormErrors) => {
      if (field in errors.value) {
        delete errors.value[field];
      }
    };

    const addPersonality = () => {
      const trait = newPersonality.value.trim();
      if (trait && !form.value.personality.includes(trait)) {
        form.value.personality.push(trait);
        newPersonality.value = '';
      }
    };

    const removePersonality = (trait: string) => {
      form.value.personality = form.value.personality.filter(t => t !== trait);
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

    const analyzeCharacter = async () => {
      if (!isFormValid.value) return;

      analyzingAI.value = true;
      try {
        const response = await axios.post('/api/ai/analyze-character', form.value);
        aiSuggestions.value = response.data.suggestions;
      } catch (error) {
        console.error('AI分析失败:', error);
      } finally {
        analyzingAI.value = false;
      }
    };

    const handleSave = async () => {
      if (!validateForm()) return;

      loading.value = true;
      try {
        if (isEdit.value) {
          await axios.put(`/api/characters/${characterId}`, form.value);
        } else {
          await axios.post('/api/characters', form.value);
        }
        router.push('/characters');
      } catch (error) {
        console.error('保存角色失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = () => {
      router.push('/characters');
    };

    return {
      isEdit,
      form,
      errors,
      loading,
      newPersonality,
      newTag,
      aiSuggestions,
      analyzingAI,
      isFormValid,
      clearError,
      addPersonality,
      removePersonality,
      addTag,
      removeTag,
      analyzeCharacter,
      handleSave,
      handleCancel
    };
  }
});
</script>

<style scoped>
.character-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.edit-header {
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

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.error, textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.personality-tags, .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.personality-tag, .tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.875rem;
}

.add-personality, .add-tag {
  display: flex;
  gap: 0.5rem;
}

.add-personality input, .add-tag input {
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

.ai-suggestions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f7ff;
  border-radius: 8px;
}

.suggestion-content {
  margin: 1rem 0;
  white-space: pre-line;
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

.btn-analyze {
  background: #007bff;
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.btn-analyze:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 
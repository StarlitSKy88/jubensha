<template>
  <div class="character-list">
    <div class="list-header">
      <h2>角色列表</h2>
      <div class="actions">
        <button class="btn-create" @click="handleCreate">创建角色</button>
      </div>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索角色..."
        @input="handleSearch"
      >
      <div class="filters">
        <select v-model="selectedTags" multiple>
          <option v-for="tag in availableTags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
        <label>
          <input
            type="checkbox"
            v-model="showPublicOnly"
            @change="handleSearch"
          >
          仅显示公开角色
        </label>
      </div>
    </div>

    <div class="character-grid" v-if="!loading">
      <div
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        :class="{ 'is-public': character.isPublic }"
      >
        <div class="card-header">
          <h3>{{ character.name }}</h3>
          <div class="card-actions">
            <button @click="handleEdit(character)">编辑</button>
            <button @click="handleDelete(character)" class="danger">删除</button>
          </div>
        </div>
        
        <div class="card-body">
          <p class="description">{{ character.description }}</p>
          <div class="tags" v-if="character.tags?.length">
            <span
              v-for="tag in character.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <span class="creator">创建者: {{ character.creator?.username }}</span>
          <span class="date">{{ formatDate(character.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      加载中...
    </div>

    <div class="pagination" v-if="total > 0">
      <button
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>确定要删除角色 "{{ selectedCharacter?.name }}" 吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="danger">确认删除</button>
          <button @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

interface Character {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  isPublic: boolean;
  creator?: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default defineComponent({
  name: 'CharacterList',

  setup() {
    const router = useRouter();
    const characters = ref<Character[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = 12;
    const searchQuery = ref('');
    const selectedTags = ref<string[]>([]);
    const showPublicOnly = ref(false);
    const showDeleteConfirm = ref(false);
    const selectedCharacter = ref<Character | null>(null);
    const availableTags = ref<string[]>([
      '主角', '配角', '反派', '中立', '神秘人物'
    ]);

    const fetchCharacters = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/characters', {
          params: {
            page: currentPage.value,
            limit: pageSize,
            search: searchQuery.value,
            tags: selectedTags.value,
            isPublic: showPublicOnly.value
          }
        });
        characters.value = response.data.data;
        total.value = response.data.pagination.total;
      } catch (error) {
        console.error('获取角色列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchCharacters();
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchCharacters();
    };

    const handleCreate = () => {
      router.push('/characters/create');
    };

    const handleEdit = (character: Character) => {
      router.push(`/characters/${character.id}/edit`);
    };

    const handleDelete = (character: Character) => {
      selectedCharacter.value = character;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      if (!selectedCharacter.value) return;

      try {
        await axios.delete(`/api/characters/${selectedCharacter.value.id}`);
        await fetchCharacters();
      } catch (error) {
        console.error('删除角色失败:', error);
      } finally {
        showDeleteConfirm.value = false;
        selectedCharacter.value = null;
      }
    };

    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      selectedCharacter.value = null;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('zh-CN');
    };

    const totalPages = computed(() => Math.ceil(total.value / pageSize));

    onMounted(() => {
      fetchCharacters();
    });

    return {
      characters,
      loading,
      total,
      currentPage,
      totalPages,
      searchQuery,
      selectedTags,
      showPublicOnly,
      availableTags,
      showDeleteConfirm,
      selectedCharacter,
      handleSearch,
      handlePageChange,
      handleCreate,
      handleEdit,
      handleDelete,
      confirmDelete,
      cancelDelete,
      formatDate
    };
  }
});
</script>

<style scoped>
.character-list {
  padding: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 2rem;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.character-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-body {
  margin-bottom: 1rem;
}

.description {
  margin-bottom: 1rem;
  color: #666;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button.danger {
  background: #dc3545;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.is-public {
  border-left: 4px solid #28a745;
}
</style> 
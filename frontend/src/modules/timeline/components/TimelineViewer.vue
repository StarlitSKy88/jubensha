<template>
  <div class="timeline-viewer">
    <div class="viewer-header">
      <h2>时间线</h2>
      <div class="header-actions">
        <button class="btn-create" @click="handleCreate">创建事件</button>
        <div class="view-controls">
          <button 
            class="btn-view"
            :class="{ active: viewMode === 'timeline' }"
            @click="viewMode = 'timeline'"
          >
            时间轴视图
          </button>
          <button 
            class="btn-view"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
        </div>
      </div>
    </div>

    <div class="viewer-filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索事件..."
          @input="handleSearch"
        >
      </div>
      <div class="filter-group">
        <select v-model="selectedCharacters" multiple>
          <option value="">所有角色</option>
          <option
            v-for="character in characters"
            :key="character.id"
            :value="character.id"
          >
            {{ character.name }}
          </option>
        </select>
        <select v-model="selectedTags" multiple>
          <option value="">所有标签</option>
          <option
            v-for="tag in availableTags"
            :key="tag"
            :value="tag"
          >
            {{ tag }}
          </option>
        </select>
        <select v-model="importance">
          <option value="">所有重要性</option>
          <option value="1">低</option>
          <option value="2">较低</option>
          <option value="3">中等</option>
          <option value="4">较高</option>
          <option value="5">高</option>
        </select>
        <button 
          class="btn-filter"
          @click="applyFilters"
        >
          应用筛选
        </button>
      </div>
    </div>

    <div 
      v-if="viewMode === 'timeline'"
      class="timeline-view"
      :class="{ loading }"
    >
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div
          v-for="event in sortedEvents"
          :key="event.id"
          class="timeline-event"
          :class="{
            'important': event.importance >= 4,
            'selected': selectedEvent?.id === event.id
          }"
          @click="selectEvent(event)"
        >
          <div class="event-dot" :style="{ backgroundColor: getEventColor(event) }"></div>
          <div class="event-content">
            <div class="event-header">
              <h3>{{ event.title }}</h3>
              <span class="event-date">{{ formatDate(event.date) }}</span>
            </div>
            <p class="event-description">{{ event.description }}</p>
            <div class="event-meta">
              <div class="event-characters">
                <span
                  v-for="character in event.characters"
                  :key="character.id"
                  class="character-tag"
                >
                  {{ character.name }}
                </span>
              </div>
              <div class="event-tags">
                <span
                  v-for="tag in event.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-else
      class="list-view"
      :class="{ loading }"
    >
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>标题</th>
            <th>描述</th>
            <th>角色</th>
            <th>重要性</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="event in sortedEvents"
            :key="event.id"
            :class="{ 'important': event.importance >= 4 }"
          >
            <td>{{ formatDate(event.date) }}</td>
            <td>{{ event.title }}</td>
            <td>{{ event.description }}</td>
            <td>
              <div class="event-characters">
                <span
                  v-for="character in event.characters"
                  :key="character.id"
                  class="character-tag"
                >
                  {{ character.name }}
                </span>
              </div>
            </td>
            <td>{{ getImportanceText(event.importance) }}</td>
            <td>
              <button @click="handleEdit(event)">编辑</button>
              <button @click="handleDelete(event)" class="danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 事件详情侧边栏 -->
    <div 
      v-if="selectedEvent"
      class="event-sidebar"
      :class="{ open: !!selectedEvent }"
    >
      <div class="sidebar-header">
        <h3>事件详情</h3>
        <button class="btn-close" @click="selectedEvent = null">&times;</button>
      </div>
      <div class="sidebar-content">
        <h4>{{ selectedEvent.title }}</h4>
        <div class="event-time">
          <i class="icon-calendar"></i>
          {{ formatDate(selectedEvent.date) }}
        </div>
        <div class="event-location" v-if="selectedEvent.location">
          <i class="icon-location"></i>
          {{ selectedEvent.location }}
        </div>
        <p class="event-description">{{ selectedEvent.description }}</p>
        <div class="event-characters">
          <h5>相关角色</h5>
          <div class="character-list">
            <span
              v-for="character in selectedEvent.characters"
              :key="character.id"
              class="character-tag"
            >
              {{ character.name }}
            </span>
          </div>
        </div>
        <div class="event-tags" v-if="selectedEvent.tags?.length">
          <h5>标签</h5>
          <div class="tag-list">
            <span
              v-for="tag in selectedEvent.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="event-importance">
          <h5>重要性</h5>
          <div class="importance-indicator">
            {{ getImportanceText(selectedEvent.importance) }}
          </div>
        </div>
        <div class="event-actions">
          <button @click="handleEdit(selectedEvent)">编辑</button>
          <button @click="handleDelete(selectedEvent)" class="danger">删除</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>确定要删除事件 "{{ eventToDelete?.title }}" 吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="danger">确认删除</button>
          <button @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  importance: number;
  characters: Array<{
    id: string;
    name: string;
  }>;
  tags?: string[];
  isPublic: boolean;
}

interface Character {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'TimelineViewer',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const projectId = route.params.projectId as string;

    const events = ref<TimelineEvent[]>([]);
    const characters = ref<Character[]>([]);
    const loading = ref(false);
    const viewMode = ref<'timeline' | 'list'>('timeline');
    const selectedEvent = ref<TimelineEvent | null>(null);
    const showDeleteConfirm = ref(false);
    const eventToDelete = ref<TimelineEvent | null>(null);

    // 筛选条件
    const searchQuery = ref('');
    const selectedCharacters = ref<string[]>([]);
    const selectedTags = ref<string[]>([]);
    const importance = ref<string>('');

    const availableTags = computed(() => {
      const tags = new Set<string>();
      events.value.forEach(event => {
        event.tags?.forEach(tag => tags.add(tag));
      });
      return Array.from(tags);
    });

    const sortedEvents = computed(() => {
      return events.value
        .filter(event => {
          if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            return event.title.toLowerCase().includes(query) ||
                   event.description.toLowerCase().includes(query);
          }
          return true;
        })
        .filter(event => {
          if (selectedCharacters.value.length) {
            return event.characters.some(c => selectedCharacters.value.includes(c.id));
          }
          return true;
        })
        .filter(event => {
          if (selectedTags.value.length) {
            return event.tags?.some(tag => selectedTags.value.includes(tag));
          }
          return true;
        })
        .filter(event => {
          if (importance.value) {
            return event.importance === Number(importance.value);
          }
          return true;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    onMounted(async () => {
      await Promise.all([
        loadEvents(),
        loadCharacters()
      ]);
    });

    const loadEvents = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`/api/projects/${projectId}/events`);
        events.value = response.data.data;
      } catch (error) {
        console.error('加载事件列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadCharacters = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/characters`);
        characters.value = response.data.data;
      } catch (error) {
        console.error('加载角色列表失败:', error);
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getEventColor = (event: TimelineEvent) => {
      const colors = [
        '#6c757d', // 低
        '#17a2b8', // 较低
        '#28a745', // 中等
        '#ffc107', // 较高
        '#dc3545'  // 高
      ];
      return colors[event.importance - 1];
    };

    const getImportanceText = (importance: number) => {
      const texts = ['低', '较低', '中等', '较高', '高'];
      return texts[importance - 1];
    };

    const handleSearch = () => {
      // 搜索逻辑已通过计算属性实现
    };

    const applyFilters = () => {
      // 筛选逻辑已通过计算属性实现
    };

    const selectEvent = (event: TimelineEvent) => {
      selectedEvent.value = event;
    };

    const handleCreate = () => {
      router.push(`/projects/${projectId}/timeline/create`);
    };

    const handleEdit = (event: TimelineEvent) => {
      router.push(`/projects/${projectId}/timeline/${event.id}/edit`);
    };

    const handleDelete = (event: TimelineEvent) => {
      eventToDelete.value = event;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      if (!eventToDelete.value) return;

      try {
        await axios.delete(`/api/projects/${projectId}/events/${eventToDelete.value.id}`);
        await loadEvents();
        if (selectedEvent.value?.id === eventToDelete.value.id) {
          selectedEvent.value = null;
        }
      } catch (error) {
        console.error('删除事件失败:', error);
      } finally {
        showDeleteConfirm.value = false;
        eventToDelete.value = null;
      }
    };

    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      eventToDelete.value = null;
    };

    return {
      events,
      characters,
      loading,
      viewMode,
      selectedEvent,
      showDeleteConfirm,
      eventToDelete,
      searchQuery,
      selectedCharacters,
      selectedTags,
      importance,
      availableTags,
      sortedEvents,
      formatDate,
      getEventColor,
      getImportanceText,
      handleSearch,
      applyFilters,
      selectEvent,
      handleCreate,
      handleEdit,
      handleDelete,
      confirmDelete,
      cancelDelete
    };
  }
});
</script>

<style scoped>
.timeline-viewer {
  padding: 2rem;
  height: 100%;
  position: relative;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.btn-view {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-view.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.viewer-filters {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.timeline-view {
  position: relative;
  padding: 2rem 0;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}

.timeline-event {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 2rem;
  cursor: pointer;
}

.event-dot {
  position: absolute;
  left: -5px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #007bff;
  border: 2px solid white;
}

.event-content {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.event-date {
  color: #666;
  font-size: 0.875rem;
}

.event-description {
  margin-bottom: 1rem;
  color: #444;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.character-tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.tag {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #666;
}

.list-view table {
  width: 100%;
  border-collapse: collapse;
}

.list-view th,
.list-view td {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.list-view th {
  background: #f8f9fa;
  font-weight: 500;
}

.event-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  z-index: 1000;
}

.event-sidebar.open {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.sidebar-content {
  padding: 1rem;
}

.event-time,
.event-location {
  color: #666;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  z-index: 2000;
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

.loading {
  opacity: 0.5;
  pointer-events: none;
}

.btn-create {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-filter {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.danger {
  background: #dc3545;
  color: white;
}

.important {
  border-left: 4px solid #dc3545;
}
</style> 
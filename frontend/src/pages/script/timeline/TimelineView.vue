<template>
  <div class="timeline-page">
    <div class="page-header">
      <h1>{{ script?.title }} - 时间线</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleBack">
          返回剧本
        </el-button>
      </div>
    </div>

    <TimelineViewer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import TimelineViewer from '@/modules/timeline/components/TimelineViewer.vue';

interface Script {
  id: string;
  title: string;
}

export default defineComponent({
  name: 'TimelineView',

  components: {
    TimelineViewer
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const scriptId = route.params.id as string;
    const script = ref<Script | null>(null);

    onMounted(async () => {
      try {
        const response = await axios.get(`/api/scripts/${scriptId}`);
        script.value = response.data.data;
      } catch (error) {
        console.error('加载剧本信息失败:', error);
      }
    });

    const handleBack = () => {
      router.push(`/scripts/${scriptId}`);
    };

    return {
      script,
      handleBack
    };
  }
});
</script>

<style scoped>
.timeline-page {
  padding: 2rem;
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
</style> 
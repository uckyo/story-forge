<template>
  <div class="setting-card-view">
    <!-- 头部控制区 -->
    <div class="flex flex-col sm:flex-row gap-2 mb-2">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <el-tag size="small" type="info">设定</el-tag>
        <el-button
          size="small"
          type="info"
          @click="$emit('create-card', 'setting')"
          class="flex-shrink-0"
        >
          <el-icon>
            <Plus />
          </el-icon>
          新建设定
        </el-button>
      </div>
      <!-- 搜索框 -->
      <div class="flex gap-2 flex-1">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设定..."
          size="small"
          :prefix-icon="Search"
          class="flex-1"
        />
      </div>
    </div>
    <!-- 设定卡片显示区域 -->
    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="setting in filteredSettings"
          :key="setting.id"
          class="bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer"
          @click="$emit('edit-card', setting)"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="text-sm font-medium">{{ setting.name }}</div>
            <el-button
              link
              size="small"
              @click.stop="$emit('delete-card', setting.id)"
              title="删除"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="text-xs text-gray-600 mb-1">
            <span class="font-medium">类别：</span
            >{{ setting.category || "未知" }}
          </div>
          <div class="text-xs text-gray-600 mb-1">
            <span class="font-medium">影响范围：</span
            >{{ setting.scope || "全局" }}
          </div>
          <div class="text-xs text-gray-600 line-clamp-2 mb-2">
            {{ setting.brief || "无描述" }}
          </div>
          <div class="text-xs text-gray-500 mb-1">
            {{ formatDate(setting.createdAt) }}
          </div>
          <div
            v-if="setting.tags && setting.tags.length > 0"
            class="flex flex-wrap gap-1"
          >
            <el-tag
              v-for="tag in setting.tags"
              :key="tag"
              size="small"
              class="bg-gray-100 text-gray-800 border-0"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Search, Plus, Edit, Delete, Close } from "@element-plus/icons-vue";

// Props
const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits([
  "select-card",
  "create-card",
  "edit-card",
  "delete-card",
]);

// Reactive data
const searchQuery = ref("");

// 过滤后的设定卡片
const filteredSettings = computed(() => {
  let result = props.cards.filter((card) => card.type === "setting");

  // 按搜索词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (card) =>
        card.name.toLowerCase().includes(query) ||
        (card.brief && card.brief.toLowerCase().includes(query)) ||
        (card.category && card.category.toLowerCase().includes(query)) ||
        (card.scope && card.scope.toLowerCase().includes(query))
    );
  }

  return result;
});

// 格式化日期
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};
</script>

<style scoped>
.setting-card-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

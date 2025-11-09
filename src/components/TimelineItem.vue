<template>
  <el-collapse-item
    :name="item.id"
    class="timeline-item bg-white rounded-lg px-4 border-0 shadow-sm mb-2 overflow-hidden"
    :data-card-id="item.cardId"
  >
    <template #title>
      <div class="flex items-center gap-2 w-full">
        <span class="flex-1">{{ collapseTitle }}</span>
        <el-tag
          :type="getPlotTypeColor(card?.plotType)"
          size="small"
          effect="dark"
        >
          {{ getPlotTypeName(card?.plotType) }}
        </el-tag>
        <el-button
          size="small"
          link
          @click.stop="handleEdit"
          title="编辑"
          class="ml-auto"
        >
          <el-icon>
            <Edit />
          </el-icon>
        </el-button>
      </div>
    </template>
    <!-- 折叠内容区域 -->
    <div class="p-4">
      <!-- 编辑按钮 -->
      <div class="flex justify-end"></div>
    </div>
  </el-collapse-item>
</template>

<script setup>
import { computed } from "vue";
import { ElCollapseItem } from "element-plus";
import { useBookStore } from "../stores/bookStore";
import { Edit } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const bookStore = useBookStore();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["delete", "edit-plot-point"]);

// 计算属性：获取当前项对应的卡片数据
const card = computed(() => {
  // 支持通过id或cardId获取卡片数据
  return (
    bookStore.getCardById(props.item.id) ||
    bookStore.getCardById(props.item.cardId)
  );
});

// 获取剧情点类型名称
// 剧情点类型配置
const plotTypeConfig = {
  main: {
    name: "主线",
    color: "primary",
    bgColor: "bg-blue-500",
  },
  side: {
    name: "支线",
    color: "success",
    bgColor: "bg-green-500",
  },
  foreshadow: {
    name: "伏笔",
    color: "warning",
    bgColor: "bg-yellow-500",
  },
  default: {
    name: "主线",
    color: "primary",
    bgColor: "bg-blue-500",
  },
};

// 获取剧情点类型名称
const getPlotTypeName = (type) => {
  return plotTypeConfig[type]?.name || plotTypeConfig.default.name;
};

// 获取剧情点类型颜色
const getPlotTypeColor = (type) => {
  return plotTypeConfig[type]?.color || plotTypeConfig.default.color;
};

// 计算折叠面板的标题
const collapseTitle = computed(() => {
  const index = props.item.index !== undefined ? props.item.index + 1 : 1;
  const content = card.value?.content || "";

  // 直接返回文本内容，标签将在模板中单独处理
  return `${index}. ${content}`;
});

const handleEdit = (event) => {
  event?.stopPropagation();
  if (card.value) {
    emit("edit-plot-point", card.value);
  }
};
</script>

<style scoped>
/* 内容区域样式 */
.timeline-item-content {
  transition: all 0.2s ease;
  cursor: grab;
}

:deep(.el-collapse-item__wrap) {
  border: none;
}

:deep(.el-collapse-item__header) {
  border: none;
}

.ghost :deep(.el-collapse-item__wrap),
.ghost :deep(.el-collapse-item__header) {
  background-color: #e6f4ff;
}

.timeline-item-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-item-content:active {
  cursor: grabbing;
}
</style>

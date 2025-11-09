<template>
  <div class="relative timeline-item" :data-card-id="item.cardId">
    <!-- 时间线圆点 - 显示序号 -->
    <div
      class="absolute -left-12 w-6 h-6 rounded-full flex items-center justify-center"
      :class="getPlotTypeColorClass(card?.plotType)"
    >
      <span class="text-white text-xs">
        {{ item.index !== undefined ? item.index + 1 : 1 }}
      </span>
    </div>

    <!-- 卡片内容 -->
    <div
      class="timeline-item-content bg-white rounded-lg p-4 shadow cursor-pointer hover:bg-gray-50 transition-all duration-300"
      @click="handleSelect"
      :data-card-id="item.cardId"
      draggable="true"
    >
      <!-- 剧情点卡片显示 -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="text-sm text-gray-800">
            <span>{{ card?.content }}</span>
            <el-tag
              class="ml-2"
              :type="getPlotTypeColor(card?.plotType)"
              size="small"
              effect="dark"
            >
              {{ getPlotTypeName(card?.plotType) }}
            </el-tag>
          </div>
        </div>
        <div class="flex gap-1">
          <el-button size="small" link @click.stop="handleDelete">
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useBookStore } from "../stores/bookStore";
import { Close } from "@element-plus/icons-vue";
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

// 获取剧情点类型对应的背景色类名
const getPlotTypeColorClass = (type) => {
  return plotTypeConfig[type]?.bgColor || plotTypeConfig.default.bgColor;
};

const handleSelect = (event) => {
  // 阻止事件冒泡并触发编辑事件
  event?.stopPropagation();
  if (card.value) {
    emit("edit-plot-point", card.value);
  }
};

const handleDelete = async (event) => {
  event?.stopPropagation();
  try {
    await ElMessageBox.confirm("确定要从时间线中移除这个项目吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    emit("delete", props.item.id);
  } catch {
    // 用户取消删除操作，不执行任何操作
  }
};
</script>

<style scoped>
/* 时间线项样式 */
.timeline-item {
  position: relative;
}

/* 内容区域样式 */
.timeline-item-content {
  transition: all 0.2s ease;
  cursor: grab;
}

.timeline-item.ghost .timeline-item-content {
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

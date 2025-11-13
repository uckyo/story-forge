<template>
  <el-collapse class="w-full border-0" expand-icon-position="left">
    <VueDraggable
      class="drag-area"
      v-model="list"
      group="g1"
      ghostClass="ghost"
    >
      <el-collapse-item
        v-for="el in modelValue"
        :key="el.id"
        :name="el.id"
        class="timeline-item rounded-lg px-2 border-0 overflow-hidden"
        :data-card-id="el.cardId"
      >
        <template #title>
          <div class="flex items-center gap-2 w-full">
            <span class="flex-1">
              <ContentRenderer :content="el.content" />
            </span>
            <el-tag
              :type="getPlotTypeColor(el?.plotType)"
              size="small"
              effect="dark"
            >
              {{ getPlotTypeName(el?.plotType) }}
            </el-tag>
            <el-button
              size="small"
              link
              @click.stop="handleEdit(el.id, $event)"
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
        <div>
          <NestedComponent
            v-model="el.children"
            @edit-plot-point="(id, $event) => handleEdit(id, $event)"
          />
        </div>
      </el-collapse-item>
    </VueDraggable>
  </el-collapse>
</template>
<script setup>
import { VueDraggable } from "vue-draggable-plus";
import { computed } from "vue";
import ContentRenderer from "./ContentRenderer.vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

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
// 获取剧情点类型颜色
const getPlotTypeColor = (type) => {
  return plotTypeConfig[type]?.color || plotTypeConfig.default.color;
};

// 获取剧情点类型名称
const getPlotTypeName = (type) => {
  return plotTypeConfig[type]?.name || plotTypeConfig.default.name;
};
const emits = defineEmits(["update:modelValue", "edit-plot-point"]);
const list = computed({
  get: () => props.modelValue,
  set: (value) => emits("update:modelValue", value),
});
const handleEdit = (id, event) => {
  event.stopPropagation();
  if (id) {
    emits("edit-plot-point", id, event);
  }
};
</script>
<style scoped>
.drag-area {
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.el-collapse {
  --el-collapse-header-height: 30px;
}
.el-collapse-item {
  background-color: white;
  border: 1px solid #e4e7ed;
}
.ghost :deep(.el-collapse-item__header),
.ghost :deep(.el-collapse-item__wrap),
.ghost.el-collapse-item,
.ghost .el-collapse-item {
  background-color: #f5f7fa;
}
:deep(.el-collapse-item__header),
:deep(.el-collapse-item__wrap) {
  border: none;
}
:deep(.el-collapse-item__content) {
  padding: 0;
}
</style>

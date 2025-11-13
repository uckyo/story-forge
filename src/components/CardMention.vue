<template>
  <el-popover
    placement="top"
    :title="card?.name || '卡片详情'"
    trigger="contextmenu"
    width="350"
  >
    <template #reference>
      <span :class="['card-mention', `card-type-${card?.type || 'default'}`]">
        {{ name }}
      </span>
    </template>
    <div v-if="card" class="popover-content">
      <!-- 类型信息 -->
      <div class="card-type-info">类型：{{ getTypeName(card.type) }}</div>

      <!-- 详细信息 -->
      <div class="card-details">
        <!-- 角色信息 -->
        <template v-if="card.type === 'character'">
          <div v-if="card.gender" class="detail-item">
            性别：{{ card.gender }}
          </div>
          <div v-if="card.age" class="detail-item">年龄：{{ card.age }}</div>
          <div v-if="card.personality" class="detail-item">
            性格：{{ card.personality }}
          </div>
          <div v-if="card.background" class="detail-item">
            背景：{{ card.background }}
          </div>
          <div v-if="card.relationships" class="detail-item">
            关系：{{ card.relationships }}
          </div>
          <div v-if="card.appearance" class="detail-item">
            外貌：{{ card.appearance }}
          </div>
          <div v-if="card.skills" class="detail-item">
            技能：{{ card.skills }}
          </div>
        </template>

        <!-- 地点信息 -->
        <template v-else-if="card.type === 'location'">
          <div v-if="card.locationType" class="detail-item">
            地点类型：{{ card.locationType }}
          </div>
          <div v-if="card.region" class="detail-item">
            区域：{{ card.region }}
          </div>
          <div v-if="card.geography" class="detail-item">
            地理特征：{{ card.geography }}
          </div>
          <div v-if="card.description" class="detail-item">
            描述：{{ card.description }}
          </div>
          <div v-if="card.features" class="detail-item">
            特点：{{ card.features }}
          </div>
          <div v-if="card.significance" class="detail-item">
            重要性：{{ card.significance }}
          </div>
        </template>

        <!-- 物品信息 -->
        <template v-else-if="card.type === 'item'">
          <div v-if="card.itemType" class="detail-item">
            物品类型：{{ card.itemType }}
          </div>
          <div v-if="card.owner" class="detail-item">
            所有者：{{ card.owner }}
          </div>
          <div v-if="card.value" class="detail-item">
            价值：{{ card.value }}
          </div>
          <div v-if="card.description" class="detail-item">
            描述：{{ card.description }}
          </div>
          <div v-if="card.function" class="detail-item">
            功能：{{ card.function }}
          </div>
          <div v-if="card.history" class="detail-item">
            历史：{{ card.history }}
          </div>
          <div v-if="card.significance" class="detail-item">
            重要性：{{ card.significance }}
          </div>
        </template>

        <!-- 事件信息 -->
        <template v-else-if="card.type === 'event'">
          <div v-if="card.time" class="detail-item">时间：{{ card.time }}</div>
          <div v-if="card.location" class="detail-item">
            地点：{{ card.location }}
          </div>
          <div v-if="card.participants" class="detail-item">
            参与者：{{ card.participants }}
          </div>
          <div v-if="card.description" class="detail-item">
            描述：{{ card.description }}
          </div>
          <div v-if="card.outcome" class="detail-item">
            结果：{{ card.outcome }}
          </div>
          <div v-if="card.significance" class="detail-item">
            重要性：{{ card.significance }}
          </div>
        </template>

        <!-- 设定信息 -->
        <template v-else-if="card.type === 'setting'">
          <div v-if="card.category" class="detail-item">
            类别：{{ card.category }}
          </div>
          <div v-if="card.influence" class="detail-item">
            影响：{{ card.influence }}
          </div>
          <div v-if="card.description" class="detail-item">
            描述：{{ card.description }}
          </div>
          <div v-if="card.details" class="detail-item">
            详情：{{ card.details }}
          </div>
          <div v-if="card.rules" class="detail-item">
            规则：{{ card.rules }}
          </div>
        </template>

        <!-- 剧情点信息 -->
        <template v-else-if="card.type === 'plotPoint'">
          <div v-if="card.plotType" class="detail-item">
            剧情类型：{{ card.plotType }}
          </div>
          <div v-if="card.content" class="detail-item">
            内容：{{ card.content }}
          </div>
          <div
            v-if="card.children && card.children.length > 0"
            class="detail-item"
          >
            子剧情点：{{ card.children.length }} 个
          </div>
        </template>

        <!-- 通用信息 - 展示其他可能存在的属性 -->
        <div v-if="card.content" class="detail-item">
          内容：{{ card.content }}
        </div>
        <div v-if="card.color" class="detail-item">颜色：{{ card.color }}</div>
        <div
          v-if="card.relations && card.relations.length > 0"
          class="detail-item"
        >
          关联：{{ card.relations.join(", ") }}
        </div>
        <div v-if="card.notes" class="detail-item">备注：{{ card.notes }}</div>
        <div v-if="card.tags" class="detail-item">
          标签：{{
            Array.isArray(card.tags) ? card.tags.join(", ") : card.tags
          }}
        </div>
      </div>

      <!-- 简要描述 - 始终展示，如果没有brief则显示空 -->
      <div class="card-brief">
        <strong>简介：</strong>{{ card.brief || "暂无简介" }}
      </div>
    </div>
    <div v-else class="error-message">卡片【{{ name }}】不存在</div>
  </el-popover>
</template>

<script setup>
import { computed } from "vue";
import { useBookStore } from "../stores/bookStore";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const bookStore = useBookStore();

// 根据name查找卡片
const card = computed(() => {
  return bookStore.currentBookCards.find((card) => card.name === props.name);
});

// 获取类型名称的函数
const getTypeName = (type) => {
  const typeMap = {
    character: "角色",
    location: "地点",
    item: "物品",
    event: "事件",
    setting: "设定",
    default: "未知",
  };
  return typeMap[type] || typeMap.default;
};

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style scoped>
.card-mention {
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.card-mention:hover {
  opacity: 0.9;
}

/* 不同类型卡片的颜色 - 仅保留文字颜色 */
.card-type-character {
  color: #1890ff;
}

.card-type-location {
  color: #52c41a;
}

.card-type-item {
  color: #fa8c16;
}

.card-type-event {
  color: #fa541c;
}

.card-type-setting {
  color: #722ed1;
}

.card-type-default {
  color: #8c8c8c;
}

/* Popover内容样式 */
:deep(.el-popover) {
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.popover-content {
  padding: 16px;
}

.card-type-info {
  margin-bottom: 16px;
  font-weight: 500;
  color: #666;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.card-details {
  margin-bottom: 16px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}

.card-details::-webkit-scrollbar {
  width: 4px;
}

.card-details::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.card-details::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.card-details::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.detail-item {
  margin-bottom: 8px;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.card-brief {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  color: #888;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
}

.error-message {
  padding: 12px 16px;
  color: #ff7875;
  font-weight: 500;
}
</style>

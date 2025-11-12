<template>
  <el-dialog
    :modelValue="visible"
    @update:modelValue="handleUpdateVisible"
    title="卡片库"
    width="80%"
    top="5vh"
    height="90vh"
    @close="handleClose"
  >
    <!-- 左侧分类选择 -->
    <div class="card-library-container">
      <div class="left-section">
        <el-segmented
          v-model="activeType"
          direction="vertical"
          :options="segmentedOptions"
          class="type-segmented"
        />

        <!-- 左侧不再需要单独的新建按钮，使用各视图中的新建按钮 -->
      </div>

      <!-- 右侧内容区 - 动态加载专用视图 -->
      <div class="right-section">
        <component
          :is="currentComponent"
          :card-type="activeType"
          :cards="bookStore.currentBookCards"
          :selected-card="selectedCard"
          @edit-card="handleCardEdit"
          @close-edit="handleCloseEdit"
          @delete-card="handleDeleteCard"
          @create-card="handleCreateCard"
        />
      </div>
    </div>
  </el-dialog>

  <!-- 专用编辑器组件 -->
  <CharacterCardEditor
    v-model:visible="characterEditorVisible"
    :card="editingCard"
    @save="handleCardSave"
    @close="handleEditorClose"
  />

  <LocationCardEditor
    v-model:visible="locationEditorVisible"
    :card="editingCard"
    @save="handleCardSave"
    @close="handleEditorClose"
  />

  <ItemCardEditor
    v-model:visible="itemEditorVisible"
    :card="editingCard"
    @save="handleCardSave"
    @close="handleEditorClose"
  />

  <EventCardEditor
    v-model:visible="eventEditorVisible"
    :card="editingCard"
    @save="handleCardSave"
    @close="handleEditorClose"
  />

  <SettingCardEditor
    v-model:visible="settingEditorVisible"
    :card="editingCard"
    @save="handleCardSave"
    @close="handleEditorClose"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  User,
  Position,
  Goods,
  Document,
  Tools,
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { useBookStore } from "../stores/bookStore";
import CharacterCardView from "./cardViews/CharacterCardView.vue";
import LocationCardView from "./cardViews/LocationCardView.vue";
import ItemCardView from "./cardViews/ItemCardView.vue";
import EventCardView from "./cardViews/EventCardView.vue";
import SettingCardView from "./cardViews/SettingCardView.vue";
import CharacterCardEditor from "./CharacterCardEditor.vue";
import LocationCardEditor from "./LocationCardEditor.vue";
import ItemCardEditor from "./ItemCardEditor.vue";
import EventCardEditor from "./EventCardEditor.vue";
import SettingCardEditor from "./SettingCardEditor.vue";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  cards: {
    type: Array,
    default: () => [],
  },
  bookId: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits([
  "update:visible",
  "close",
  "select-card",
  "create-card",
]);

// Stores
const bookStore = useBookStore();

// Reactive data
const activeType = ref("character"); // 默认选择第一个类型

// 当前选中的卡片
const selectedCard = ref(null);

// 卡片类型配置
const cardTypes = [
  {
    value: "character",
    label: "人物",
    icon: "User",
    component: CharacterCardView,
  },
  {
    value: "location",
    label: "地点",
    icon: "Position",
    component: LocationCardView,
  },
  { value: "item", label: "物品", icon: "Goods", component: ItemCardView },
  { value: "event", label: "事件", icon: "Document", component: EventCardView },
  {
    value: "setting",
    label: "设定",
    icon: "Tools",
    component: SettingCardView,
  },
];

// 编辑器可见性控制
const characterEditorVisible = ref(false);
const locationEditorVisible = ref(false);
const itemEditorVisible = ref(false);
const eventEditorVisible = ref(false);
const settingEditorVisible = ref(false);

// 正在编辑的卡片
const editingCard = ref(null);

// 图标映射
const iconMap = {
  User: User,
  Position: Position,
  Goods: Goods,
  Document: Document,
  Tools: Tools,
};

// 分段控制器选项
const segmentedOptions = computed(() => {
  return cardTypes.map((type) => ({
    value: type.value,
    label: type.label,
    icon: iconMap[type.icon] || null,
  }));
});

// 获取当前选中类型对应的组件
const currentComponent = computed(() => {
  const typeInfo = cardTypes.find((type) => type.value === activeType.value);
  return typeInfo ? typeInfo.component : null;
});

// Methods
const handleClose = () => {
  // 重置类型选择
  activeType.value = "character"; // 重置为第一个类型
  emit("update:visible", false);
  emit("close");
};

const handleUpdateVisible = (value) => {
  emit("update:visible", value);
};

// 移除不再需要的方法，这些功能现在在各专用组件中实现

// 处理创建卡片
const handleCreateCard = () => {
  // 根据当前激活的类型打开对应的编辑器
  editingCard.value = null; // 清空编辑卡片，表示新建
  openEditorByType(activeType.value);
};

// 处理卡片编辑
const handleCardEdit = (card) => {
  editingCard.value = card;
  openEditorByType(card.type);
};

// 处理关闭编辑
const handleCloseEdit = () => {
  selectedCard.value = null;
};

// 处理卡片删除
const handleDeleteCard = (cardId) => {
  ElMessageBox.confirm(
    "确定要删除这张卡片吗？删除后数据将无法恢复。",
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      bookStore.deleteCard(cardId);
    })
    .catch(() => {
      // 用户取消删除，不做处理
    });
};

// 根据类型打开对应的编辑器
const openEditorByType = (type) => {
  // 先关闭所有编辑器
  closeAllEditors();

  // 根据类型打开对应的编辑器
  switch (type) {
    case "character":
      characterEditorVisible.value = true;
      break;
    case "location":
      locationEditorVisible.value = true;
      break;
    case "item":
      itemEditorVisible.value = true;
      break;
    case "event":
      eventEditorVisible.value = true;
      break;
    case "setting":
      settingEditorVisible.value = true;
      break;
  }
};

// 关闭所有编辑器
const closeAllEditors = () => {
  characterEditorVisible.value = false;
  locationEditorVisible.value = false;
  itemEditorVisible.value = false;
  eventEditorVisible.value = false;
  settingEditorVisible.value = false;
};

// 处理编辑器关闭
const handleEditorClose = () => {
  editingCard.value = null;
};

// 处理卡片保存
const handleCardSave = (cardData) => {
  if (cardData.id) {
    // 更新现有卡片
    bookStore.updateCard(cardData);
  } else {
    // 创建新卡片 - 直接传递cardData，bookStore会自动处理与当前书本的关联
    bookStore.createCard(cardData);
  }
  editingCard.value = null;
};

// 监听visible变化，重置状态
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      activeType.value = "character";
      selectedCard.value = null;
      closeAllEditors();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.card-library-container {
  display: flex;
  height: calc(100vh - 170px);
  gap: 20px;
}

.left-section {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-segmented {
  width: 100%;
}

.type-segmented :deep(.el-segmented-item__label) {
  padding: 12px 8px;
  justify-content: center;
}

.action-buttons {
  margin-top: auto;
}

.right-section {
  flex: 1;
  overflow: auto;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}
</style>

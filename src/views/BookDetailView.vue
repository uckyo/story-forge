<template>
  <div class="storyforge-app flex flex-col h-screen bg-white text-gray-900">
    <!-- 顶部导航栏 -->
    <header
      class="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <el-button size="small" @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <h2 class="text-lg font-medium" v-if="bookStore.currentBook">
          《{{ bookStore.currentBook.title }}》
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <el-button size="small" @click="exportProject">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 中央工作区 - 时间线 -->
      <main class="flex-1 p-4 bg-gray-50 flex flex-col">
        <div class="mb-4 flex gap-2">
          <el-button type="primary" @click="showCardLibrary = true">
            <el-icon>
              <Menu />
            </el-icon>
            打开卡片库
          </el-button>
          <el-button type="success" @click="createPlotPoint">
            <el-icon>
              <Edit />
            </el-icon>
            新建剧情点
          </el-button>
        </div>
        <div
          class="overflow-auto flex-1"
          style="max-height: calc(100vh - 100px)"
        >
          <VueDraggable
            ref="draggableRef"
            v-model="localTimelineItems"
            animation="150"
            ghostClass="ghost"
            class="relative pl-9 border-l-2 border-gray-300 flex flex-col gap-2.5 w-[800px] mx-auto"
          >
            <TimelineItem
              v-for="item in timelineItems"
              :key="item.id"
              :item="item"
              @select="handleCardSelect"
              @update="updateTimelineItem"
              @delete="deleteTimelineItem"
              @edit-plot-point="handleEditPlotPoint"
            />
          </VueDraggable>
        </div>
      </main>

      <!-- 使用新的CardLibrary组件 -->
      <CardLibrary
        :visible="showCardLibrary"
        @update:visible="showCardLibrary = $event"
        :book-id="String(bookStore.currentBook?.id)"
        @select-card="handleCardSelect"
        @create-card="handleCreateCard"
      />
    </div>
  </div>

  <!-- 剧情点创建/编辑弹窗 -->
  <PlotPointCardEditor
    :visible="showPlotPointCreator"
    :card="editCard"
    @update:visible="showPlotPointCreator = $event"
    @save="handlePlotPointSaved"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Download, Edit, Menu } from "@element-plus/icons-vue";
import TimelineItem from "../components/TimelineItem.vue";
import CardLibrary from "../components/CardLibrary.vue";
import PlotPointCardEditor from "../components/PlotPointCardEditor.vue";
import { VueDraggable } from "vue-draggable-plus";
import { useBookStore } from "../stores/bookStore";

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();

// 响应式数据
const showCardLibrary = ref(false);
const draggableRef = ref(null);

// 计算属性
const timelineItems = computed(() => bookStore.getCurrentBookTimeline());

// 用于拖拽的本地数组引用
const localTimelineItems = computed({
  get: () => bookStore.getCurrentBookTimeline(),
  set: (newValue) => {
    // 直接替换当前书本的plotPoints数组，保留必要的id和数据
    const currentBook = bookStore.currentBook;
    if (currentBook) {
      // 提取排序后的剧情点数据，移除index属性（因为这是getter动态添加的）
      currentBook.plotPoints = newValue.map((item) => {
        const { index, ...rest } = item;
        return rest;
      });
      // 保存到localStorage
      bookStore.saveBooks();
    }
  },
});

// 方法
function goBack() {
  router.push("/");
}

// 响应式数据
const showPlotPointCreator = ref(false);
const editCard = ref(null);

// 处理剧情点创建
function createPlotPoint() {
  // 清空编辑卡片数据，表示创建新卡片
  editCard.value = null;
  // 显示剧情点编辑器
  showPlotPointCreator.value = true;
}

// 处理剧情点保存
function handlePlotPointSaved(cardData) {
  // 添加错误处理，确保cardData不为null
  if (!cardData) {
    console.error("handlePlotPointSaved接收到null数据");
    ElMessage.error("剧情点保存失败：数据为空");
    showPlotPointCreator.value = false;
    return;
  }

  // 关闭编辑器
  showPlotPointCreator.value = false;
  ElMessage.success("剧情点保存成功");
}

// 处理编辑剧情点
function handleEditPlotPoint(card) {
  // 设置要编辑的卡片
  editCard.value = card;
  // 显示编辑器
  showPlotPointCreator.value = true;
}

function updateTimelineItem(updatedItem) {
  // 时间线更新现在由bookStore管理，不需要额外操作
  console.log("Timeline item updated:", updatedItem);
}

function deleteTimelineItem(itemId) {
  // 获取卡片信息
  const card = bookStore.getCardById(itemId);

  if (card) {
    // 直接调用deleteCard方法，它会根据卡片类型进行适当的删除操作
    const result = bookStore.deleteCard(itemId);

    if (result) {
      ElMessage.success("剧情点删除成功");
    } else {
      ElMessage.error("删除失败，请稍后重试");
    }
  } else {
    ElMessage.error("找不到要删除的剧情点");
  }
}

function exportProject() {
  // 导出项目数据 - 使用bookStore的导出方法
  if (bookStore.currentBook?.id) {
    const projectData = bookStore.exportBookData(bookStore.currentBook.id);

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileName = `${
      bookStore.currentBook.title || "未命名项目"
    }_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();

    ElMessage.success("项目导出成功");
  } else {
    ElMessage.error("导出失败：没有选中的书本");
  }
}

// 生命周期
onMounted(() => {
  // 加载数据
  bookStore.loadBooks();

  // 设置当前书本ID
  const bookId = parseInt(route.params.id);
  if (bookId) {
    bookStore.setCurrentBook(bookId);
  }

  // 检查书本是否存在
  if (!bookStore.currentBook) {
    ElMessage.error("书本不存在");
    router.push("/");
  }
});

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      bookStore.setCurrentBook(parseInt(newId));
      // 这里可以添加根据书本ID加载对应数据的逻辑
    }
  }
);
</script>

<style scoped>
/* 保持原有样式 */
.ghost {
  opacity: 0.5;
  background-color: rgba(147, 197, 253, 0.1);
}
</style>

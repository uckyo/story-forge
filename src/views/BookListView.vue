<template>
  <div class="h-full w-full flex flex-col bg-white text-gray-900">
    <!-- 顶部导航栏 -->
    <header class="bg-gray-100 px-6 py-4 border-b border-gray-300">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-blue-400">StoryForge</h1>
        <div class="flex gap-2">
          <el-button type="primary" size="large" @click="showCreateBookDialog = true">
            <el-icon><Plus /></el-icon>
            新建书本
          </el-button>
          <el-button size="large" @click="importBook">
            <el-icon><Upload /></el-icon>
            导入书本
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 书本列表 -->
    <main class="flex-1 overflow-auto p-6">
      <div v-if="books.length === 0" class="flex flex-col items-center justify-center h-full">
        <el-empty description="暂无书本，点击上方按钮开始创建"></el-empty>
        <el-button type="primary" class="mt-4" @click="showCreateBookDialog = true">
          <el-icon><Plus /></el-icon>
          创建第一本书本
        </el-button>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="book in books"
          :key="book.id"
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-gray-200"

          @click="openBook(book)"
        >
          <div class="p-5">
            <h3 class="text-xl font-bold mb-2">{{ book.title }}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ book.description || '无描述' }}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>创建于 {{ formatDate(book.createdAt) }}</span>
              <el-button-group>
                <el-button size="small" link @click.stop="editBook(book)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" link @click.stop="deleteBook(book)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建书本对话框 -->
    <el-dialog
      v-model="showCreateBookDialog"
      title="新建书本"
      width="400px"
      @close="resetBookForm"
    >
      <el-form :model="bookForm" label-width="80px">
        <el-form-item label="书名">
          <el-input v-model="bookForm.title" placeholder="请输入书本名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="bookForm.description"
            type="textarea"
            placeholder="请输入书本描述（可选）"
:rows="3"
          ></el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateBookDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateBook">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useBookStore } from '../stores/bookStore'

const router = useRouter()
const bookStore = useBookStore()
const showCreateBookDialog = ref(false)
const bookForm = ref({
    title: '',
    description: ''
  })

// 计算属性：书本列表
const books = ref([])

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

// 打开书本
function openBook(book) {
  bookStore.setCurrentBook(book.id)
  router.push(`/book/${book.id}`)
}

// 重置表单
function resetBookForm() {
  bookForm.value = {
    title: '',
    description: ''
  }
}

// 当前正在编辑的书本ID
const editingBookId = ref(null)

// 确认创建或编辑书本
function confirmCreateBook() {
  if (!bookForm.value.title.trim()) {
    ElMessage.warning('请输入书本名称')
    return
  }
  
  // 移除封面颜色属性
  const bookData = { ...bookForm.value }
  delete bookData.coverColor
  
  // 检查是创建还是编辑
  if (editingBookId.value) {
    // 编辑现有书本
    bookStore.updateBook({
      id: editingBookId.value,
      ...bookData
    })
    ElMessage.success('书本更新成功')
  } else {
    // 创建新书本
    const newBook = bookStore.createBook(bookData)
    // 创建后自动打开新书本
    openBook(newBook)
  }
  
  showCreateBookDialog.value = false
  resetBookForm()
  editingBookId.value = null
}

// 编辑书本
function editBook(book) {
  bookForm.value = {
    title: book.title,
    description: book.description
  }
  editingBookId.value = book.id
  showCreateBookDialog.value = true
}

// 导入书本
function importBook() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const bookData = JSON.parse(e.target.result)
          // 使用bookStore的导入方法
          bookStore.importBookData(bookData)
          
          ElMessage.success('书本导入成功')
        } catch (error) {
          ElMessage.error('书本导入失败：文件格式不正确')
        }
      }
      reader.readAsText(file)
    }
  }
  
  input.click()
}

// 删除书本
function deleteBook(book) {
  ElMessageBox.confirm(
    `确定要删除书本《${book.title}》吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    bookStore.deleteBook(book.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 加载书本数据
onMounted(() => {
  bookStore.loadBooks()
  books.value = bookStore.books
  
  // 监听书本数据变化
  watch(
    () => bookStore.books,
    (newBooks) => {
      books.value = newBooks
    },
    { deep: true }
  )
})
</script>

<style scoped>
.el-button--text {
  color: #666;
}

.el-button--text:hover {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
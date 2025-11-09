<template>
  <div class="card-editor p-4 bg-white rounded-lg h-full flex flex-col">
    <div class="mb-4">
      <div class="flex gap-2 mb-4">
        <el-radio-group v-model="formData.type">
          <el-radio value="character">
            <el-icon><User /></el-icon>
            角色
          </el-radio>
          <el-radio value="organization">
            <el-icon><OfficeBuilding /></el-icon>
            组织
          </el-radio>
          <el-radio value="location">
            <el-icon><Position /></el-icon>
            地点
          </el-radio>
          <el-radio value="event">
            <el-icon><Star /></el-icon>
            事件
          </el-radio>
          <el-radio value="document">
            <el-icon><Document /></el-icon>
            文档
          </el-radio>
        </el-radio-group>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto">
      <!-- 基本信息 -->
      <div class="mb-4">
        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="请输入卡片名称"></el-input>
        </el-form-item>
        <el-form-item label="简述">
          <el-input v-model="formData.brief" type="textarea" placeholder="简要描述"></el-input>
        </el-form-item>
        <el-form-item label="详细内容">
          <el-input 
            v-model="formData.content" 
            type="textarea" 
            placeholder="详细描述（支持@提及其他卡片）"
            :rows="6"
            @input="handleContentInput"
            @focus="showMentionDropdown = false"
            @keyup.enter="handleEnterKey"
          ></el-input>
        </el-form-item>
      </div>

      <!-- @提及选择框 -->
      <Transition name="dropdown">
        <div 
          v-if="showMentionDropdown && filteredMentionCards.length > 0"
          class="mention-dropdown absolute bg-white rounded border border-gray-300 shadow-lg z-10 max-h-60 overflow-y-auto"
          @click.stop
        >
          <ul class="p-1">
            <li 
              v-for="card in filteredMentionCards"
              :key="card.id"
              class="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
              @click="selectMention(card)"
            >
              <el-icon v-if="card.type === 'character'"><User /></el-icon>
              <el-icon v-else-if="card.type === 'organization'"><OfficeBuilding /></el-icon>
              <el-icon v-else-if="card.type === 'location'"><Position /></el-icon>
              <el-icon v-else-if="card.type === 'event'"><Star /></el-icon>
              <el-icon v-else><Document /></el-icon>
              {{ card.name }}
            </li>
          </ul>
        </div>
      </Transition>

      <!-- 标签 -->
      <div class="mb-4">
        <el-form-item label="标签">
          <el-input 
            v-model="tagInput"
            placeholder="输入标签后按回车添加"
            @keyup.enter="addTag"
            class="mb-2"
          ></el-input>
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
          >{{ tag }}</el-tag>
        </el-form-item>
      </div>

      <!-- 颜色标记 -->
      <div class="mb-4">
      </div>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-300 flex justify-end gap-2">
      <el-button @click="cancelChanges">取消</el-button>
      <el-button type="primary" @click="saveChanges">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, OfficeBuilding, Position, Star, Document } from '@element-plus/icons-vue'
import { useBookStore } from '../stores/bookStore'

const props = defineProps({
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:card', 'close', 'select'])

const bookStore = useBookStore()

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  type: 'character',
  brief: '',
  content: '',
  tags: [],
  color: ''
})

// 标签输入
const tagInput = ref('')

// @提及相关
const showMentionDropdown = ref(false)
const mentionKeyword = ref('')
const mentionPosition = ref({
  left: 0,
  top: 0
})

// 计算属性 - 过滤@提及的卡片
const filteredMentionCards = computed(() => {
    if (!mentionKeyword.value) {
      return bookStore.currentBookCards.filter(card => card.id !== formData.id).slice(0, 10)
    }
    return bookStore.currentBookCards.filter(card => 
      card.id !== formData.id && 
      card.name.toLowerCase().includes(mentionKeyword.value.toLowerCase())
    ).slice(0, 10)
  })

// 监听卡片变化，更新表单数据
watch(() => props.card, (newCard) => {
  if (newCard) {
    Object.assign(formData, {
      id: newCard.id,
      name: newCard.name || '',
      type: newCard.type || 'character',
      brief: newCard.brief || '',
      content: newCard.content || '',
      tags: [...(newCard.tags || [])],
      color: newCard.color || ''
    })
  } else {
    // 新建卡片时重置表单
    Object.assign(formData, {
      id: null,
      name: '',
      type: 'character',
      brief: '',
      content: '',
      tags: [],
      color: ''
    })
  }
}, { immediate: true })

// 处理内容输入，检测@提及
const handleContentInput = (event) => {
  const content = event.target.value
  const cursorPosition = event.target.selectionStart
  const textBeforeCursor = content.substring(0, cursorPosition)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  // 检查是否在编辑@提及
  if (lastAtIndex !== -1 && /^[^\s]*$/.test(textBeforeCursor.substring(lastAtIndex + 1))) {
    mentionKeyword.value = textBeforeCursor.substring(lastAtIndex + 1)
    showMentionDropdown.value = true
    
    // 设置下拉框位置
    nextTick(() => {
      const inputRect = event.target.getBoundingClientRect()
      const editorRect = document.querySelector('.card-editor').getBoundingClientRect()
      mentionPosition.value = {
        left: inputRect.left - editorRect.left,
        top: inputRect.top - editorRect.top + inputRect.height + 5
      }
    })
  } else {
    showMentionDropdown.value = false
  }
}

// 处理回车键
const handleEnterKey = () => {
  if (showMentionDropdown.value && filteredMentionCards.value.length > 0) {
    selectMention(filteredMentionCards.value[0])
  }
}

// 选择提及的卡片
const selectMention = (card) => {
  const content = formData.content
  const cursorPosition = content.lastIndexOf('@' + mentionKeyword.value) + mentionKeyword.value.length + 1
  const newContent = content.substring(0, content.lastIndexOf('@')) + '@' + card.name + ' '
  formData.content = newContent
  showMentionDropdown.value = false
  
  // 聚焦到输入框并设置光标位置
  nextTick(() => {
    const input = document.querySelector('textarea[placeholder="详细描述（支持@提及其他卡片）"]')
    if (input) {
      input.focus()
      input.selectionStart = input.selectionEnd = newContent.length
    }
  })
}

// 添加标签
const addTag = () => {
  if (tagInput.value.trim() && !formData.tags.includes(tagInput.value.trim())) {
    formData.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (tag) => {
  const index = formData.tags.indexOf(tag)
  if (index !== -1) {
    formData.tags.splice(index, 1)
  }
}

// 保存更改
const saveChanges = () => {
  if (!formData.name.trim()) {
    ElMessage.warning('请输入卡片名称')
    return
  }
  
  const cardData = {
    ...formData,
    name: formData.name.trim(),
    brief: formData.brief.trim(),
    content: formData.content.trim()
  }
  
  if (formData.id) {
    bookStore.updateCard(cardData)
    ElMessage.success('卡片更新成功')
  } else {
    const newCard = bookStore.createCard(cardData)
    ElMessage.success('卡片创建成功')
    emit('select', newCard)
  }
  
  emit('update:card', formData)
  emit('close')
}

// 取消更改
const cancelChanges = () => {
  if (props.card) {
    Object.assign(formData, {
      id: props.card.id,
      name: props.card.name || '',
      type: props.card.type || 'character',
      brief: props.card.brief || '',
      content: props.card.content || '',
      tags: [...(props.card.tags || [])],
      color: props.card.color || ''
    })
  }
  emit('close')
}
</script>

<style scoped>
.card-editor {
  color: #333;
}

.mention-dropdown {
  position: fixed;
  min-width: 200px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}
</style>
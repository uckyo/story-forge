<template>
  <el-dialog
    :modelValue="visible"
    @update:modelValue="handleUpdateVisible"
    title="编辑剧情点"
    width="600px"
    @close="handleClose"
  >
    <el-form label-width="80px">
      <el-form-item label="内容" required>
        <el-input 
          v-model="formData.content" 
          type="textarea" 
          placeholder="请输入剧情点内容"
          :rows="6"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="类型" required>
        <el-select v-model="formData.plotType" placeholder="选择剧情点类型">
          <el-option label="主线" value="main"></el-option>
          <el-option label="支线" value="side"></el-option>
          <el-option label="伏笔" value="foreshadow"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="saveChanges">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useBookStore } from '../stores/bookStore'

const bookStore = useBookStore()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'save'])

// 表单数据
const formData = reactive({
  content: '',
  plotType: 'main'
})

// 监听卡片变化，更新表单数据
watch(() => props.card, (newCard) => {
  if (newCard) {
    formData.content = newCard.content || ''
    formData.plotType = newCard.plotType || 'main'
  } else {
    // 重置表单
    formData.content = ''
    formData.plotType = 'main'
  }
}, { immediate: true })

// 处理更新可见性
const handleUpdateVisible = (value) => {
  emit('update:visible', value)
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 保存更改
const saveChanges = () => {
  if (!formData.content.trim()) {
    ElMessage.error('内容不能为空')
    return
  }
  
  const cardData = {
    id: props.card?.id,
    type: 'plotPoint',
    content: formData.content.trim(),
    plotType: formData.plotType
  }
  
  
  console.log('cardData',cardData)
  let savedCard
  // 如果是编辑现有卡片
  if (props.card && props.card.id) {
    // 记录要更新的卡片ID
    console.log('尝试更新卡片，ID:', props.card.id)
    
    // 检查卡片是否存在于当前书本中
    const cardExists = bookStore.currentBook?.cards?.some(card => card.id === props.card.id)
    console.log('卡片在当前书本中是否存在:', cardExists)
    
    // 记录当前书本状态
    console.log('当前书本是否存在:', !!bookStore.currentBook)
    
    const updateData = {
      ...props.card,
      ...cardData,
      updatedAt: Date.now()
    }
    console.log('更新数据:', updateData)
    
    savedCard = bookStore.updateCard(updateData)
    
    // 检查更新结果
    if (!savedCard) {
      console.error('updateCard返回null，可能的原因：1) 当前书本为null，或2) 找不到匹配ID的卡片')
      ElMessage.error('更新卡片失败：找不到要更新的卡片')
      return
    }
  } else {
    // 创建新卡片 - 保存返回的实际创建的卡片对象
    savedCard = bookStore.createCard(cardData)
    
    // 检查创建结果
    if (!savedCard) {
      console.error('createCard返回null，可能是当前书本为null')
      ElMessage.error('创建卡片失败：无法添加到当前书本')
      return
    }
  }
  
  ElMessage.success('保存成功')
  emit('save', savedCard) // 传递实际保存的卡片对象
  emit('update:visible', false)
}
</script>

<style scoped>
.el-dialog__headerbtn {
  top: 10px;
  right: 10px;
}
</style>
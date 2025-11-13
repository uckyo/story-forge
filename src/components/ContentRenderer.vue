<template>
  <div class="content-renderer">
    <template v-for="(item, index) in parsedContent" :key="index">
      <span v-if="item.type === 'text'" v-html="item.value"></span>
      <CardMention v-else-if="item.type === 'mention'" :name="item.name" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CardMention from './CardMention.vue'

// 定义props
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 解析内容中的@name#格式
const parsedContent = computed(() => {
  if (!props.content) return []
  
  const result = []
  // 使用正则表达式匹配@name#格式
  const mentionRegex = /@([^#]+)#/g
  let lastIndex = 0
  let match
  
  while ((match = mentionRegex.exec(props.content)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      const text = props.content.substring(lastIndex, match.index)
      result.push({
        type: 'text',
        value: text.replace(/\n/g, '<br>') // 将换行符转换为<br>标签
      })
    }
    
    // 添加提及内容
    result.push({
      type: 'mention',
      name: match[1]
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // 添加最后剩余的文本
  if (lastIndex < props.content.length) {
    const text = props.content.substring(lastIndex)
    result.push({
      type: 'text',
      value: text.replace(/\n/g, '<br>') // 将换行符转换为<br>标签
    })
  }
  
  return result
})
</script>

<style scoped>
.content-renderer {
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
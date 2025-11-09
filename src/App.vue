<template>
  <div class="app-container h-screen overflow-hidden">
    <router-view />
  </div>
</template>

<script setup>
// App.vue 现在只作为路由的容器，具体内容在各个视图组件中实现
import { onMounted } from 'vue'
import { useBookStore } from './stores/bookStore'

const bookStore = useBookStore()

// 应用启动时加载书本数据
onMounted(() => {
  bookStore.loadBooks()
})
</script>

<style scoped>
.app-container {
  background-color: #ffffff;
}
</style>
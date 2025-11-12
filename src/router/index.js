import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "bookList",
      component: () => import("../views/BookListView.vue"),
    },
    {
      path: "/book/:id",
      name: "bookDetail",
      component: () => import("../views/BookDetailView.vue"),
    },
  ],
});

export default router;

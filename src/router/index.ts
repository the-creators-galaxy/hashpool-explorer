import { createRouter, createWebHistory } from "vue-router";
import TransactionsPage from "@/pages/TransactionsPage.vue";
import TransactionDetailPage from "@/pages/TransactionDetailPage.vue";
import AboutPage from "@/pages/AboutPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "transactions",
      component: TransactionsPage,
    },
    {
      path: "/about",
      name: "about",
      component: AboutPage,
    },
    {
      path: "/:transactionId(\\d+.\\d+\\.\\d+@\\d+\\.\\d+)",
      name: "transaction",
      component: TransactionDetailPage,
    },
    {
      path: "/:uknownPath(.*)",
      redirect: "/",
    },
  ],
});

export default router;

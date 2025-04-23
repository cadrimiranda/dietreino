// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import Login from "../components/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import ClientList from "../components/ClientList.vue";
import TrainingUpload from "../components/TrainingUpload.vue";
import DietUpload from "../components/DietUpload.vue";

// You can create these components later
const ClientDetail = { template: "<div>Client Detail View</div>" };
const TrainingList = { template: "<div>Training Plans List</div>" };
const DietList = { template: "<div>Diet Plans List</div>" };
const ProgressView = { template: "<div>Progress View</div>" };
const Settings = { template: "<div>Settings</div>" };

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "clients",
        name: "Clients",
        component: ClientList,
      },
      {
        path: "clients/:id",
        name: "ClientDetail",
        component: ClientDetail,
        props: true,
      },
      {
        path: "training",
        name: "TrainingPlans",
        component: TrainingList,
      },
      {
        path: "training/upload",
        name: "TrainingUpload",
        component: TrainingUpload,
      },
      {
        path: "diet",
        name: "DietPlans",
        component: DietList,
      },
      {
        path: "diet/upload",
        name: "DietUpload",
        component: DietUpload,
      },
      {
        path: "progress/review",
        name: "ProgressView",
        component: ProgressView,
      },
      {
        path: "settings",
        name: "Settings",
        component: Settings,
      },
    ],
  },
  // Catch all route - redirect to dashboard if authenticated, otherwise to login
  {
    path: "/:pathMatch(.*)*",
    redirect: (to) => {
      // This is a simple example - in a real app, you'd check authentication state
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";
      return isAuthenticated ? "/dashboard" : "/login";
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // This is a simple example - in a real app, you'd use your auth store
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;

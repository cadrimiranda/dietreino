import { createRouter, createWebHistory } from "vue-router";
import { message } from "ant-design-vue";
import { useAuth } from "../composables/useAuth";
import MainLayout from "../components/MainLayout.vue";
import Login from "../pages/login/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import ClientList from "../pages/client/ClientList.vue";
import TrainingUpload from "../components/TrainingUpload.vue";
import DietUpload from "../components/DietUpload.vue";
import NotFound from "../components/NotFound.vue";

const ClientDetail = { template: "<div>Client Detail View</div>" };
const TrainingList = { template: "<div>Training Plans List</div>" };
const DietList = { template: "<div>Diet Plans List</div>" };
const ProgressView = { template: "<div>Progress View</div>" };
const Settings = { template: "<div>Settings</div>" };

const { isAuthenticated } = useAuth();

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated.value) {
    message.warning("Você precisa fazer login para acessar esta página");
    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  } else if (to.name === "Login" && isAuthenticated.value) {
    next({ name: "Dashboard" });
  } else if (to.name === "NotFound") {
    if (to.path.startsWith("/dashboard") || to.path.startsWith("/admin")) {
      if (!isAuthenticated.value) {
        message.warning("Você precisa fazer login para acessar esta área");
        next({ name: "Login" });
        return;
      }
    }

    next();
  } else {
    next();
  }
});

export default router;

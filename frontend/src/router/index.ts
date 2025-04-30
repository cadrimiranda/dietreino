// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext,
} from "vue-router";
import { message } from "ant-design-vue";
import MainLayout from "../components/MainLayout.vue";
import Login from "../pages/login/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import ClientList from "../pages/client/ClientList.vue";
import TrainingUpload from "../components/TrainingUpload.vue";
import DietUpload from "../components/DietUpload.vue";
import NotFound from "../components/NotFound.vue";
import {
  LocalStorageTokenService,
  TokenValidator,
} from "../security/authStorage";
import ClientWorkoutDetails from "@/pages/client/workout/ClientWorkoutDetails.vue";

// Define component interfaces for the simple template components
interface TemplateComponent {
  template: string;
}

const ClientDetail: TemplateComponent = {
  template: "<div>Client Detail View</div>",
};
const TrainingList: TemplateComponent = {
  template: "<div>Training Plans List</div>",
};
const DietList: TemplateComponent = { template: "<div>Diet Plans List</div>" };
const ProgressView: TemplateComponent = {
  template: "<div>Progress View</div>",
};
const Settings: TemplateComponent = { template: "<div>Settings</div>" };

// Avoid using useAuth directly in router setup
// Instead, use the token validator directly to check authentication
const tokenService = new LocalStorageTokenService();
const tokenValidator = new TokenValidator();

// Check authentication status without using useAuth
function isAuthenticated(): boolean {
  const token = tokenService.getAccessToken();
  return tokenValidator.isTokenValid(token);
}

const routes: Array<RouteRecordRaw> = [
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
        meta: { requiresAuth: true },
        children: [
          {
            path: "",
            name: "ClientList",
            component: ClientList,
          },
          {
            path: ":clientId",
            name: "ClientView",
            component: ClientWorkoutDetails,
          },
        ],
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

router.beforeEach(
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    // Check authentication without composable
    const authenticated = isAuthenticated();

    if (requiresAuth && !authenticated) {
      message.warning("Você precisa fazer login para acessar esta página");
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
    } else if (to.name === "Login" && authenticated) {
      next({ name: "Dashboard" });
    } else if (to.name === "NotFound") {
      if (to.path.startsWith("/dashboard") || to.path.startsWith("/admin")) {
        if (!authenticated) {
          message.warning("Você precisa fazer login para acessar esta área");
          next({ name: "Login" });
          return;
        }
      }

      next();
    } else {
      next();
    }
  }
);

export default router;

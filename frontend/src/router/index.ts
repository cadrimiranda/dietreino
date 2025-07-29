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
import ClientWorkoutDetails from "@/pages/client/workout/ClientWorkoutDetails.vue";
import NewWorkout from "@/pages/client/workout/NewWorkout.vue";
import WorkoutHistory from "@/pages/client/workout/WorkoutHistory.vue";
import WorkoutHistoryView from "@/views/WorkoutHistoryView.vue";
import TrainingList from "@/pages/training/TrainingList.vue";

interface TemplateComponent {
  template: string;
}

const ClientDetail: TemplateComponent = {
  template: "<div>Client Detail View</div>",
};
const DietList: TemplateComponent = { template: "<div>Diet Plans List</div>" };
const ProgressView: TemplateComponent = {
  template: "<div>Progress View</div>",
};
const Settings: TemplateComponent = { template: "<div>Settings</div>" };

let authProvider: any = null;

export function setAuthProvider(provider: any) {
  authProvider = provider;
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
        redirect: "/login",
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
            props: true,
          },
        ],
      },
      {
        path: "/clients/:clientId/workout/new",
        name: "NewWorkout",
        component: NewWorkout,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/clients/:clientId/workout/:workoutId/history",
        name: "ClientWorkoutHistory",
        component: WorkoutHistory,
        meta: { requiresAuth: true },
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
        path: "workout-history",
        name: "WorkoutHistory",
        component: WorkoutHistoryView,
        meta: { requiresAuth: true, roles: ['TRAINER', 'CLIENT'] },
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

router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (!authProvider) {
    console.warn("Auth provider not set, allowing navigation");
    next();
    return;
  }

  if (!authProvider.isInitialized.value) {
    console.warn("Auth provider not initialized, allowing navigation");
    next();
    return;
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (to.name === "Login") {
    if (authProvider.isAuthenticated.value) {
      next({ name: "Dashboard" });
      return;
    }
    next();
    return;
  }

  if (requiresAuth && !authProvider.isAuthenticated.value) {
    message.warning("Você precisa fazer login para acessar esta página");
    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  next();
});

export default router;

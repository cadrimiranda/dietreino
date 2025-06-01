<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-gray-900 text-white transition-all duration-300 overflow-hidden"
      :class="sidebarOpen ? 'w-60' : 'w-16'"
    >
      <div
        class="flex items-center justify-center h-16 p-4 border-b border-gray-700"
      >
        <img
          v-if="sidebarOpen"
          src="@/assets/logo-full.svg"
          alt="DietTreinoAI"
          class="h-8 transition-all duration-300"
        />
        <img
          v-else
          src="@/assets/logo-icon.svg"
          alt="DT"
          class="h-8 transition-all duration-300"
        />
      </div>

      <nav class="flex-1 mt-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg hover:bg-gray-800 transition-all"
          :class="{ 'bg-gray-800 text-blue-400': isActive(item.path) }"
        >
          <i :class="[item.icon, 'text-xl']"></i>
          <span v-if="sidebarOpen" class="text-sm font-medium">{{
            item.name
          }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <button
          @click="logout"
          class="flex items-center justify-center md:justify-start gap-2 w-full text-gray-400 hover:text-white transition-all"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="sidebarOpen" class="text-sm">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Topbar -->
      <header
        class="flex items-center justify-between bg-white px-4 h-16 shadow-sm flex-shrink-0"
      >
        <div class="flex items-center gap-4">
          <button @click="toggleSidebar" class="p-2 rounded hover:bg-gray-100">
            <i :class="sidebarOpen ? 'fas fa-outdent' : 'fas fa-indent'"></i>
          </button>
          <h1 class="font-semibold text-lg truncate">{{ pageTitle }}</h1>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative">
            <button
              @click="toggleNotifications"
              class="relative p-2 rounded hover:bg-gray-100"
            >
              <i class="far fa-bell"></i>
              <span
                v-if="unreadNotifications"
                class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ unreadNotifications }}
              </span>
            </button>

            <!-- Dropdown -->
            <div
              v-if="notificationsOpen"
              class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-30"
            >
              <div class="p-4 border-b font-semibold">Notificações</div>
              <div v-if="notifications.length" class="max-h-64 overflow-y-auto">
                <div
                  v-for="(notification, index) in notifications"
                  :key="index"
                  class="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                  @click="markAsRead(index)"
                >
                  <i :class="[notification.icon, 'text-blue-500 mt-1']"></i>
                  <div>
                    <p class="text-sm font-medium">{{ notification.title }}</p>
                    <p class="text-xs text-gray-500">{{ notification.time }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="p-4 text-sm text-gray-500 text-center">
                Sem novas notificações.
              </div>
            </div>
          </div>

          <button
            @click="toggleUserMenu"
            class="flex items-center p-2 rounded hover:bg-gray-100"
          >
            <div
              class="h-8 w-8 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-semibold"
            >
              {{ userInitials }}
            </div>
            <i class="fas fa-chevron-down ml-2 text-xs"></i>
          </button>

          <!-- User Dropdown -->
          <div
            v-if="userMenuOpen"
            class="absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-30"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <i class="fas fa-user mr-2"></i> Perfil
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <i class="fas fa-cog mr-2"></i> Configurações
            </router-link>
            <div class="border-t border-gray-100 my-1"></div>
            <button
              @click="logout"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <i class="fas fa-sign-out-alt mr-2"></i> Sair
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 overflow-y-auto bg-gray-50"
        @click="closeMenus"
      >
        <div class="p-4 md:p-8">
          <div class="max-w-7xl mx-auto">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export default defineComponent({
  name: "MainLayout",
  setup() {
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      sidebarOpen: true,
      userMenuOpen: false,
      notificationsOpen: false,
      unreadNotifications: 2,
      userName: "Carlos Miranda",
      navItems: [
        { name: "Dashboard", path: "/dashboard", icon: "fas fa-gauge" },
        { name: "Clientes", path: "/clients", icon: "fas fa-user-group" },
        { name: "Treinos", path: "/training", icon: "fas fa-running" },
        { name: "Dietas", path: "/diet", icon: "fas fa-utensils" },
        { name: "Relatórios", path: "/reports", icon: "fas fa-clipboard-list" },
        { name: "Configurações", path: "/settings", icon: "fas fa-sliders-h" },
      ] as NavItem[],
      notifications: [
        {
          title: "Novo cliente cadastrado",
          time: "5 min atrás",
          icon: "fas fa-user-plus",
        },
        {
          title: "Treino atualizado",
          time: "1 hora atrás",
          icon: "fas fa-dumbbell",
        },
      ],
    };
  },
  computed: {
    userInitials(): string {
      return this.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },
    pageTitle(): string {
      const route = (this.$route.name as string) || "";
      return route.charAt(0).toUpperCase() + route.slice(1);
    },
  },
  methods: {
    markAsRead(index: number) {
      this.notifications.splice(index, 1);
      this.unreadNotifications = this.notifications.length;
    },
    isActive(path: string): boolean {
      return this.$route.path.startsWith(path);
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      localStorage.setItem("sidebarOpen", String(this.sidebarOpen));
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
      this.notificationsOpen = false;
    },
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen;
      this.userMenuOpen = false;
    },
    closeMenus() {
      this.userMenuOpen = false;
      this.notificationsOpen = false;
    },
    logout() {
      const auth = useAuth();
      auth.logout().then((success) => {
        if (success) {
          this.$router.push("/login");
        }
      });
    },
    checkMobile() {
      if (window.innerWidth < 768) {
        this.sidebarOpen = false;
      }
    },
    loadUserPreferences() {
      const savedSidebar = localStorage.getItem("sidebarOpen");
      if (savedSidebar !== null) {
        this.sidebarOpen = savedSidebar === "true";
      }
    },
  },
  created() {
    this.loadUserPreferences();
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    watch(
      () => this.$route,
      () => {
        this.closeMenus();
      }
    );
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
});
</script>

<style scoped>
/* Scroll Custom */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Active route highlight */
.router-link-active {
  position: relative;
}
.router-link-active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background-color: #3b82f6;
  border-radius: 0 4px 4px 0;
}
</style>

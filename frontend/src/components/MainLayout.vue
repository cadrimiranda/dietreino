<!-- MainLayout.vue -->
<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="bg-gray-800 text-white w-64 flex-shrink-0 transition-all duration-300"
      :class="{
        'w-64': sidebarOpen,
        'w-16': !sidebarOpen,
        '-ml-16 md:ml-0': !sidebarOpen && isMobile,
        'ml-0': sidebarOpen && isMobile,
      }"
    >
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center">
          <span v-if="sidebarOpen" class="text-xl font-semibold"
            >DietTreinoAI</span
          >
        </div>
      </div>

      <div class="p-4" v-if="sidebarOpen">
        <div class="flex items-center mb-4">
          <div
            class="h-10 w-10 rounded-full bg-gray-600 mr-3 flex items-center justify-center"
          >
            <span>{{ userInitials }}</span>
          </div>
          <div>
            <p class="font-medium">{{ userName }}</p>
            <p class="text-sm text-gray-400">{{ userRole }}</p>
          </div>
        </div>
      </div>

      <nav class="mt-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          :class="{ 'bg-gray-700 text-white': isActive(item.path) }"
        >
          <i :class="item.icon" class="text-xl" :title="item.name"></i>
          <span v-if="sidebarOpen" class="ml-3">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="mt-auto p-4 border-t border-gray-700">
        <button
          @click="logout"
          class="flex items-center text-gray-300 hover:text-white"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="sidebarOpen" class="ml-3">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm z-10">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex items-center">
            <button
              @click="toggleSidebar"
              class="text-gray-600 hover:text-gray-800 mr-4"
            >
              <i class="fas fa-bars"></i>
            </button>
            <h1 class="text-xl font-semibold">{{ pageTitle }}</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div class="relative">
              <button
                @click="toggleNotifications"
                class="text-gray-600 hover:text-gray-800"
              >
                <i class="far fa-bell text-xl"></i>
                <span
                  v-if="unreadNotifications"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {{ unreadNotifications }}
                </span>
              </button>
              <!-- Notifications dropdown would go here -->
            </div>

            <div class="relative">
              <button @click="toggleUserMenu" class="flex items-center">
                <div
                  class="h-8 w-8 rounded-full bg-gray-400 mr-2 flex items-center justify-center"
                >
                  <span class="text-white text-sm">{{ userInitials }}</span>
                </div>
                <span class="hidden sm:block">{{ userName }}</span>
                <i class="fas fa-chevron-down ml-2 text-sm text-gray-600"></i>
              </button>
              <!-- User dropdown would go here -->
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 bg-gray-100">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { useAuth } from "@/composables/useAuth";
import { defineComponent } from "vue";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      sidebarOpen: true,
      isMobile: false,
      userMenuOpen: false,
      notificationsOpen: false,
      unreadNotifications: 3,
      userName: "Carlos Miranda",
      userRole: "Personal Trainer",
      navItems: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "fas fa-tachometer-alt",
        },
        { name: "Clients", path: "/clients", icon: "fas fa-users" },
        { name: "Training Plans", path: "/training", icon: "fas fa-dumbbell" },
        { name: "Diet Plans", path: "/diet", icon: "fas fa-utensils" },
        { name: "Settings", path: "/settings", icon: "fas fa-cog" },
      ] as NavItem[],
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
      // Get current route name and format it
      const route = (this.$route.name as string) || "";
      return route.charAt(0).toUpperCase() + route.slice(1);
    },
  },
  methods: {
    isActive(path: string): boolean {
      return (
        this.$route.path === path || this.$route.path.startsWith(path + "/")
      );
    },
    toggleSidebar(): void {
      this.sidebarOpen = !this.sidebarOpen;
    },
    toggleUserMenu(): void {
      this.userMenuOpen = !this.userMenuOpen;
      if (this.userMenuOpen) {
        this.notificationsOpen = false;
      }
    },
    toggleNotifications(): void {
      this.notificationsOpen = !this.notificationsOpen;
      if (this.notificationsOpen) {
        this.userMenuOpen = false;
      }
    },
    logout(): void {
      const auth = useAuth();
      auth.logout().then((isLoggedOut) => {
        if (isLoggedOut) {
          this.$router.push("/login");
        }
      });
    },
    checkMobile(): void {
      this.isMobile = window.innerWidth < 768;
      if (this.isMobile) {
        this.sidebarOpen = false;
      }
    },
  },
  created() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
});
</script>

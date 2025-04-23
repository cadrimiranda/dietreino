<!-- Login.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mt-4">Professional Portal</h1>
        <p class="text-gray-600">Sign in to manage your clients</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="mb-6">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="password"
          >
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
          <div class="text-right mt-1">
            <a href="#" class="text-sm text-blue-600 hover:underline"
              >Forgot Password?</a
            >
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    handleLogin() {
      // TODO: Implement login logic
      console.log("Login attempt with:", this.email);
      localStorage.setItem("isAuthenticated", "true");
      this.$router.push("/dashboard");
      // Call your authentication service
      // this.$store.dispatch('auth/login', { email: this.email, password: this.password })
      //   .then(() => this.$router.push('/dashboard'))
      //   .catch(error => console.error('Login failed:', error));
    },
  },
};
</script>

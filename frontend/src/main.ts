// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";

import "./assets/tailwind.css";
import "./assets/custom-styles.css";
import router, { setAuthProvider } from "./router";
import { setupApollo } from "./apollo";
import { provideAuth } from "./composables/useAuthProvider";

// Create the Vue app instance
const app = createApp(App);

// Setup Apollo client
setupApollo(app);

// Setup authentication provider
const authProvider = provideAuth();
setAuthProvider(authProvider);

// Use necessary plugins
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);
app.use(router);

// Add global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error("Vue Error:", err);
  console.error("Error Info:", info);
};

// Mount the app
app.mount("#app");

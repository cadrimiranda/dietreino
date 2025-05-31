// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";

import "./assets/tailwind.css";
import "./assets/custom-styles.css";
import router from "./router";
import { setupApollo } from "./apollo";
import { useSessionControl } from "./composables/useSessionControl";

// Create the Vue app instance
const app = createApp(App);

// Setup Apollo client
setupApollo(app);

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

app.config.globalProperties.$sessionControl = useSessionControl();

app.mixin({
  mounted() {
    if (this.$root === this) {
      const sessionControl = this.$sessionControl;
      sessionControl.initializeSession();
      sessionControl.startSessionMonitoring();
    }
  },
});

// Mount the app
app.mount("#app");

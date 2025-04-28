import { createApp } from "vue";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";

import "./assets/tailwind.css";
import "./assets/custom-styles.css";
import router from "./router";
import { setupApollo } from "./apollo";

const app = createApp(App);

setupApollo(app);

app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);
app.use(router);

app.mount("#app");

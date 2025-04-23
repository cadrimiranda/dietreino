// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// For Font Awesome icons (you'll need to install this separately)
// npm install @fortawesome/fontawesome-free
import "@fortawesome/fontawesome-free/css/all.min.css";

const app = createApp(App);

// Use router
app.use(router);

// Mount the app
app.mount("#app");

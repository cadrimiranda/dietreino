// main.js
import { createApp, h } from "vue";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import { createApolloProvider } from "@vue/apollo-option";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// For Font Awesome icons (you'll need to install this separately)
// npm install @fortawesome/fontawesome-free
import "@fortawesome/fontawesome-free/css/all.min.css";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

// Criação da aplicação Vue com Apollo
const app = createApp({
  render: () => h(App),
});

// Uso do provider Apollo
app.use(apolloProvider);

// Use router
app.use(router);

// Mount the app
app.mount("#app");

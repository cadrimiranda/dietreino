// src/apollo.ts
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { App } from "vue";
import { setupAuthLink } from "./composables/useAuth";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

export let apolloClient: ApolloClient<NormalizedCacheObject>;

export function setupApollo(app: App): void {
  // Create the Apollo Client instance
  apolloClient = new ApolloClient({
    // We'll add the auth link after initialization
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
    },
  });

  // Now set up the auth link with the client instance
  const authLink = setupAuthLink(apolloClient);

  // Update the Apollo client with the complete link chain
  apolloClient.setLink(from([authLink, httpLink]));

  // Provide Apollo client to the Vue app
  provideApolloClient(apolloClient);
}

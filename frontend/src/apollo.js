import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { createAuthMiddleware } from "./security/auth.middleware";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

const tempClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
});

const authLink = createAuthMiddleware(tempClient);

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only",
    },
  },
});

export function setupApollo(app) {
  provideApolloClient(apolloClient);
}

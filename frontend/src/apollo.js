import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { authLink } from "./composables/useAuth";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

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

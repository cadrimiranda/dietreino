import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { App } from "vue";
import { authLink } from "./composables/useAuth";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

export const apolloClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
    },
  });

export function setupApollo(app: App): void {
  provideApolloClient(apolloClient);
}

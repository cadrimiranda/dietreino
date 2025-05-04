// src/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  from,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { App } from "vue";
import { setupAuthLink } from "./composables/useAuth";
import gql from "graphql-tag";
import {
  LocalStorageTokenService,
  TokenValidator,
} from "./security/authStorage";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const httpLink = createUploadLink({
  uri: "http://localhost:3000/graphql",
  headers: {
    "apollo-require-preflight": "true",
  },
});

export let apolloClient: ApolloClient<NormalizedCacheObject>;

export function setupApollo(app: App): void {
  apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
      watchQuery: {
        fetchPolicy: "network-only",
      },
    },
  });

  const authLink = setupAuthLink(apolloClient);

  apolloClient.setLink(from([authLink, httpLink]));

  provideApolloClient(apolloClient);

  app.config.globalProperties.$validateAuth = () => {
    const tokenService = new LocalStorageTokenService();
    const tokenValidator = new TokenValidator();
    if (!tokenValidator.isTokenValid(tokenService.getAccessToken())) {
      if (tokenService.getRefreshToken()) {
        apolloClient
          .query({
            query: gql`
              query {
                __typename
              }
            `,
          })
          .catch((err) => console.warn("Auth verification:", err));
      }
    }
  };

  app.mixin({
    mounted() {
      if (this.$root === this) {
        this.$validateAuth();
      }
    },
  });
}

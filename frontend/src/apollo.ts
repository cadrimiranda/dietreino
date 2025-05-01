// src/apollo.ts
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
  NormalizedCacheObject,
  gql,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { App } from "vue";
import { setupAuthLink } from "./composables/useAuth";
import {
  LocalStorageTokenService,
  TokenValidator,
} from "./security/authStorage";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

export let apolloClient: ApolloClient<NormalizedCacheObject>;

export function setupApollo(app: App): void {
  // Create the Apollo Client instance
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

  // Now set up the auth link with the client instance
  const authLink = setupAuthLink(apolloClient);

  // Update the Apollo client with the complete link chain
  apolloClient.setLink(from([authLink, httpLink]));

  // Provide Apollo client to the Vue app
  provideApolloClient(apolloClient);

  // Verificar tokens expirados ao iniciar
  app.config.globalProperties.$validateAuth = () => {
    const tokenService = new LocalStorageTokenService();
    const tokenValidator = new TokenValidator();
    if (!tokenValidator.isTokenValid(tokenService.getAccessToken())) {
      if (tokenService.getRefreshToken()) {
        // Tenta renovar o token ao iniciar se necessário
        // Esta chamada será tratada pelo AuthLink
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

  // Chame a validação após montagem
  app.mixin({
    mounted() {
      if (this.$root === this) {
        this.$validateAuth();
      }
    },
  });
}

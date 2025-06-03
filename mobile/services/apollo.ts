import {
  ApolloClient,
  InMemoryCache,
  from,
  createHttpLink,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthStorage } from '../utils/auth';
import { env } from '../config/env';

// Create HTTP link
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

// Auth link to add authorization header
const authLink = setContext(async (_, { headers }) => {
  const token = await AuthStorage.getAccessToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error link to handle authentication errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle 401 Unauthorized errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Clear tokens on unauthorized access
      AuthStorage.clearTokens().catch(console.error);
    }
  }
});

// Create Apollo Client
export const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-first',
    },
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
import { ServiceContainer } from './api/types';
import { MockApiClient } from './api/mock';
import { HttpApiClient } from './api/client';

import { env } from '../config/env';

// Create the service container
export const container: ServiceContainer = {
  api: env.useMock ? new MockApiClient() : new HttpApiClient(env.apiUrl),
};

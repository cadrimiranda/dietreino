import { ServiceContainer } from './api/types';
import { HttpApiClient } from './api/client';

import { env } from '../config/env';

// Create the service container
export const container: ServiceContainer = {
  api: new HttpApiClient(env.apiUrl),
};

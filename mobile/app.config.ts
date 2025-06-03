import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ReactNativeMobileApp',
  slug: 'ReactNativeMobileApp',
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    useMock: process.env.USE_MOCK === 'true' || false,
    eas: {
      projectId: "your-project-id"
    },
  },
});

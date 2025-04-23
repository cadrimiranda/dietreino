import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ReactNativeMobileApp',
  slug: 'ReactNativeMobileApp',
  extra: {
    apiUrl: process.env.API_URL || 'https://api.example.com',
    useMock: process.env.USE_MOCK === 'true' || true,
    eas: {
      projectId: "your-project-id"
    },
  },
});

import Constants from 'expo-constants';

interface AppConfig {
  apiUrl: string;
  useMock: boolean;
}

const extra = Constants.expoConfig?.extra;

export const env: AppConfig = {
  apiUrl: (extra?.apiUrl as string) || 'https://api.example.com',
  useMock: (extra?.useMock as boolean) || true,
};

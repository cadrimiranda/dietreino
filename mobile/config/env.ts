import Constants from 'expo-constants';

interface AppConfig {
  apiUrl: string;
  useMock: boolean;
}

const extra = Constants.expoConfig?.extra;

export const env: AppConfig = {
  apiUrl: (extra?.apiUrl as string) || 'http://localhost:3000',
  useMock: (extra?.useMock as boolean) || false,
};

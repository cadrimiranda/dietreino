import { useEffect } from 'react';
import { Redirect, usePathname, useRouter } from 'expo-router';
import { AuthStorage } from '../utils/auth';

// Lista de rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/(auth)/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await AuthStorage.isAuthenticated();
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (!isAuthenticated && !isPublicRoute) {
        // Redireciona para login se não estiver autenticado e não for rota pública
        router.replace('/login');
      } else if (isAuthenticated && isPublicRoute) {
        // Redireciona para home se estiver autenticado e tentar acessar rota pública
        router.replace('/(tabs)');
      }
    };

    checkAuth();
  }, [pathname]);

  return <>{children}</>;
}

# Documentação do Módulo de Autenticação

## Visão Geral

Este módulo implementa autenticação e autorização em uma aplicação NestJS com GraphQL. O sistema utiliza JWT (JSON Web Tokens) para gerenciar sessões e controle de acesso baseado em papéis (RBAC).

## Estrutura de Arquivos

```
src/
└── modules/
    └── auth/
        ├── auth.module.ts           # Módulo principal de autenticação
        ├── auth.service.ts          # Serviço de autenticação
        ├── auth.resolver.ts         # Resolver GraphQL para autenticação
        ├── strategies/
        │   └── jwt.strategy.ts      # Estratégia de autenticação JWT
        ├── guards/
        │   ├── gql-auth.guard.ts    # Guard de autenticação para GraphQL
        │   └── roles.guard.ts       # Guard de autorização baseada em papéis
        ├── decorators/
        │   ├── current-user.decorator.ts  # Decorator para obter usuário autenticado
        │   └── roles.decorator.ts         # Decorator para definir papéis necessários
        ├── dto/
        │   ├── login.input.ts       # DTO de entrada para login
        │   └── login-response.ts    # DTO de saída para resposta de login
        └── interfaces/
            └── jwt-payload.interface.ts  # Interface para payload do JWT
```

## Instalação

Para utilizar este módulo, você precisa instalar as seguintes dependências:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
```

Adicione as seguintes variáveis ao seu arquivo `.env`:

```
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=24h
```

## Componentes Principais

### AuthModule

O `AuthModule` é o módulo principal que configura e exporta os serviços de autenticação:

```typescript
@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'seu_segredo_super_secreto',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

O módulo:

- Importa `UsersModule` para acessar o serviço de usuários
- Configura o `PassportModule` com estratégia JWT
- Configura o `JwtModule` com segredo e tempo de expiração do token
- Fornece os serviços de autenticação

### AuthService

O `AuthService` implementa a lógica principal de autenticação:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await this.usersService.verifyPassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async login(loginInput: LoginInput): Promise<{ token: string; user: User }> {
    const { email, password } = loginInput;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
```

O serviço:

- Valida credenciais de usuário
- Gera tokens JWT ao fazer login
- Verifica usuários por ID para validação de token

### AuthResolver

O `AuthResolver` expõe endpoints GraphQL para autenticação:

```typescript
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
```

O resolver:

- Fornece mutation `login` para autenticação
- Fornece mutation `me` protegida para obter informações do usuário autenticado

### JwtStrategy

A `JwtStrategy` implementa a estratégia de validação de tokens JWT:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'seu_segredo_super_secreto',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

A estratégia:

- Extrai tokens do cabeçalho `Authorization`
- Valida o token usando o segredo configurado
- Carrega o usuário completo a partir do ID no payload

### Guards

#### GqlAuthGuard

O `GqlAuthGuard` adapta o AuthGuard do Passport para trabalhar com contexto GraphQL:

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

#### RolesGuard

O `RolesGuard` implementa autorização baseada em papéis:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorators

#### CurrentUser

O decorator `CurrentUser` facilita o acesso ao usuário autenticado:

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

#### Roles

O decorator `Roles` define os papéis necessários para acessar um endpoint:

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

## Configuração do App Module

Para integrar o módulo de autenticação, o `app.module.ts` precisa das seguintes alterações:

```typescript
@Module({
  imports: [
    // ... outros imports
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      sortSchema: true,
      context: ({ req }) => ({ req }), // Importante para o auth
    }),
    AuthModule,
    // ... outros imports
  ],
  // ... resto do módulo
})
export class AppModule {}
```

## Como Usar

### Login

```graphql
mutation {
  login(loginInput: { email: "usuario@exemplo.com", password: "senha123" }) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

### Proteger Queries/Mutations

Para proteger uma query ou mutation, aplique os guards:

```typescript
@Query(() => [UserType])
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
async users(): Promise<UserType[]> {
  return this.usersService.findAll();
}
```

### Acessar o Usuário Atual

```typescript
@Query(() => UserType)
@UseGuards(GqlAuthGuard)
async profile(@CurrentUser() user: User): Promise<User> {
  return user;
}
```

## Fluxo de Autenticação

1. **Login**: O cliente faz uma chamada para a mutation `login` com email e senha
2. **Validação**: O `AuthService` valida as credenciais contra o banco de dados
3. **Token JWT**: Se válido, um token JWT é gerado e retornado ao cliente
4. **Autorização**: O cliente inclui o token no cabeçalho `Authorization` em requisições futuras
5. **Validação do Token**: Os guards validam o token e carregam as informações do usuário
6. **Verificação de Papel**: O `RolesGuard` verifica se o usuário tem os papéis necessários

## Segurança

Recomendações importantes:

1. **Segredo JWT**: Use um segredo forte e único para o JWT
2. **HTTPS**: Sempre use HTTPS em produção para proteger tokens durante a transmissão
3. **Expiração de Token**: Configure um tempo de expiração adequado para os tokens (equilíbrio entre segurança e usabilidade)
4. **Rotação de Segredos**: Tenha um plano para rotacionar os segredos JWT periodicamente

## Extensões Possíveis

Este módulo pode ser estendido com recursos adicionais:

1. **Refresh Tokens**: Para autenticação persistente sem relogin frequente
2. **Expiração Configurável**: Permitir diferentes tempos de expiração por papel ou caso de uso
3. **Blacklist de Tokens**: Para invalidar tokens antes da expiração (logout)
4. **Autenticação de Dois Fatores**: Para segurança adicional
5. **OAuth/Social Login**: Para integração com provedores externos

## Troubleshooting

Problemas comuns:

1. **Token Inválido**: Verifique se o segredo JWT é o mesmo na geração e verificação
2. **Token Expirado**: Verifique se a data de expiração não passou
3. **CORS**: Configure adequadamente se usar clientes em outros domínios
4. **Cabeçalho Authorization**: Verifique se o formato é `Bearer <token>`

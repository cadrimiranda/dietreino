# DietTreinoAI - Plataforma de Fitness e Nutrição

Monorepo completo com Backend (NestJS + GraphQL), Frontend (Vue.js), e Mobile (React Native/Expo).

## 🚀 Execução com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

### Configuração Inicial

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd dietreinoAI
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

### Comandos Docker

#### Executar todos os serviços (recomendado)
```bash
# Subir backend, frontend, mobile-web e banco de dados
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f
```

#### Executar serviços específicos
```bash
# Apenas backend e banco
docker-compose up -d backend postgres

# Apenas frontend
docker-compose up -d frontend backend postgres

# Mobile em modo desenvolvimento (com Expo)
docker-compose --profile mobile-dev up -d mobile-dev backend postgres
```

#### Comandos úteis
```bash
# Parar todos os serviços
docker-compose down

# Rebuild das imagens
docker-compose build

# Limpar volumes (cuidado: remove dados do banco)
docker-compose down -v

# Ver status dos containers
docker-compose ps

# Executar comandos dentro dos containers
docker-compose exec backend npm run migration:run
docker-compose exec frontend npm run generate
```

### Serviços e Portas

| Serviço | URL | Porta | Descrição |
|---------|-----|-------|-----------|
| Backend API | http://localhost:3000 | 3000 | NestJS + GraphQL |
| Frontend | http://localhost:5173 | 5173 | Vue.js App |
| Mobile Web | http://localhost:19006 | 19006 | Expo Web |
| Mobile Dev | http://localhost:19000 | 19000+ | Expo Developer Tools |
| PostgreSQL | localhost:5432 | 5432 | Banco de dados |
| PgAdmin | http://localhost:5050 | 5050 | Admin do PostgreSQL |

### Profiles

#### Profile `tools` (opcional)
Inclui PgAdmin para gerenciar o banco:
```bash
docker-compose --profile tools up -d pgadmin
```

#### Profile `mobile-dev` (opcional)
Mobile em modo desenvolvimento completo:
```bash
docker-compose --profile mobile-dev up -d mobile-dev
```

### Desenvolvimento Local

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Mobile
```bash
cd mobile
npm install
npx expo start
```

### Estrutura do Projeto

```
dietreinoAI/
├── backend/          # NestJS + GraphQL API
├── frontend/         # Vue.js Web App
├── mobile/           # React Native/Expo App
├── docker-compose.yml
├── backend.Dockerfile
├── .env.example
└── README.md
```

### Troubleshooting

#### Problema: Port already in use
```bash
# Verificar quais portas estão em uso
netstat -tulpn | grep :3000

# Parar todos os containers
docker-compose down
```

#### Problema: Database connection
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do banco
docker-compose logs postgres
```

#### Problema: Frontend não conecta no backend
- Verifique se a variável `VITE_API_URL` está correta no `.env`
- Certifique-se que o backend está rodando na porta 3000

#### Problema: Mobile não conecta no backend
- Para Expo Web: Verifique `EXPO_API_URL` no `.env`
- Para device físico: Use o IP da máquina em vez de localhost

### Scripts Úteis

```bash
# Gerar tipos GraphQL no frontend e mobile
docker-compose exec frontend npm run generate
docker-compose exec mobile-web npm run generate

# Executar migrações do banco
docker-compose exec backend npm run migration:run

# Executar testes
docker-compose exec backend npm run test
docker-compose exec frontend npm run test

# Build para produção
docker-compose -f docker-compose.prod.yml up --build
```

### Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
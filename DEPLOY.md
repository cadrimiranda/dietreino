# Deploy do DietTreinoAI na Oracle Cloud

Este guia documenta o processo de deploy automatizado do backend NestJS na Oracle Cloud Free Tier.

## 📋 Pré-requisitos

### Oracle Cloud Infrastructure
- [x] Instância Compute (ARM ou x86) criada
- [x] Grupo de segurança configurado com portas:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3000 (Backend API)
- [x] Chave SSH configurada para acesso

### Local
- [x] Docker e Docker Compose instalados
- [x] SSH configurado com acesso à instância
- [x] Git configurado

## 🚀 Deploy Manual

### 1. Configurar variáveis de ambiente

Copie o template e configure suas variáveis:

```bash
cp .env.prod.template .env.prod
```

Edite `.env.prod` com suas configurações:

```bash
# Database Configuration
DB_USERNAME=dietreino_user
DB_PASSWORD=sua_senha_super_segura_aqui
DB_NAME=dietreino_db

# JWT Configuration
JWT_SECRET=seu_jwt_secret_super_seguro_aqui  
JWT_REFRESH_SECRET=seu_jwt_refresh_secret_super_seguro_aqui

# Application
NODE_ENV=production
PORT=3000
```

### 2. Configurar IP da instância

Edite o arquivo `deploy.sh` e configure o IP da sua instância Oracle Cloud:

```bash
REMOTE_HOST="SEU_IP_ORACLE_CLOUD"  # Substitua pelo IP real
```

### 3. Executar deploy

```bash
./deploy.sh
```

O script irá:
- ✅ Verificar dependências
- ✅ Testar conexão SSH
- ✅ Enviar arquivos para o servidor
- ✅ Instalar Docker/Docker Compose na instância
- ✅ Fazer build e deploy da aplicação
- ✅ Executar migrações do banco
- ✅ Verificar saúde da aplicação

## 🔄 Deploy Automatizado (GitHub Actions)

### 1. Configurar Secrets no GitHub

Acesse Settings > Secrets and variables > Actions e adicione:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `ORACLE_HOST` | IP da instância Oracle Cloud | `123.456.789.0` |
| `ORACLE_USER` | Usuário SSH (geralmente ubuntu) | `ubuntu` |
| `ORACLE_SSH_KEY` | Chave SSH privada | Conteúdo do arquivo `~/.ssh/id_rsa` |
| `DB_USERNAME` | Usuário do PostgreSQL | `dietreino_user` |
| `DB_PASSWORD` | Senha do PostgreSQL | `senha_segura` |
| `DB_NAME` | Nome do banco | `dietreino_db` |
| `JWT_SECRET` | Secret do JWT | `jwt_secret_seguro` |
| `JWT_REFRESH_SECRET` | Secret do refresh token | `jwt_refresh_secret_seguro` |

### 2. Workflow automático

O workflow `.github/workflows/deploy.yml` será executado automaticamente quando:
- Push na branch `master` ou `main`
- Execução manual via GitHub Actions

### 3. Pipeline do CI/CD

1. **Test**: Executa linting e testes
2. **Build**: Constrói imagem Docker e publica no GitHub Container Registry
3. **Deploy**: Faz deploy na Oracle Cloud
4. **Notify**: Notifica resultado do deploy

## 🏗️ Arquitetura de Deploy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  GitHub Actions │    │  Oracle Cloud   │
│                 │───▶│                 │───▶│                 │
│ - Backend code  │    │ - Build & Test  │    │ - Docker        │
│ - Dockerfile    │    │ - Docker build  │    │ - PostgreSQL    │
│ - Scripts       │    │ - Deploy        │    │ - Nginx         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Serviços deployados:

- **Backend**: NestJS + GraphQL API (porta 3000)
- **PostgreSQL**: Banco de dados (porta 5432)
- **Nginx**: Reverse proxy + SSL (portas 80/443)

## 🔧 Comandos úteis

### SSH na instância
```bash
ssh ubuntu@SEU_IP_ORACLE_CLOUD
```

### Verificar status dos containers
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml ps
```

### Ver logs da aplicação
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Executar migrações manualmente
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
```

### Reiniciar serviços
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml restart
```

### Atualizar aplicação
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Segurança

### Firewall (iptables)
```bash
# Permitir apenas portas necessárias
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### SSL/TLS
Para configurar SSL, adicione certificados em `nginx/ssl/`:
- `cert.pem` - Certificado
- `key.pem` - Chave privada

### Backup do banco
```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $DB_USERNAME $DB_NAME > backup.sql
```

## 🚨 Troubleshooting

### Application não responde
```bash
# Verificar status dos containers
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend

# Verificar conectividade do banco
docker-compose -f docker-compose.prod.yml exec backend npm run typeorm -- query "SELECT 1"
```

### Erro de conexão SSH
- Verificar IP da instância
- Verificar chave SSH
- Verificar grupo de segurança (porta 22)

### Erro de build Docker
- Verificar se há espaço em disco suficiente
- Limpar imagens antigas: `docker system prune -f`

### Porta 3000 não acessível
- Verificar grupo de segurança Oracle Cloud
- Verificar firewall da instância
- Verificar se o container está rodando

## 📊 Monitoramento

### Health check manual
```bash
curl http://SEU_IP_ORACLE_CLOUD:3000/graphql
```

### Métricas de sistema
```bash
# Uso de CPU e memória
docker stats

# Espaço em disco
df -h

# Logs do sistema
journalctl -f
```

## 🔄 Rollback

Em caso de problemas, faça rollback para versão anterior:

```bash
cd ~/dietreinoAI
docker-compose -f docker-compose.prod.yml down
docker pull IMAGEM_ANTERIOR:tag
# Editar docker-compose.prod.yml com tag anterior
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Logs importantes

- **Application logs**: `docker-compose logs backend`
- **Database logs**: `docker-compose logs postgres` 
- **Nginx logs**: `docker-compose logs nginx`
- **System logs**: `journalctl -u docker`

---

**🎉 Pronto!** Sua aplicação DietTreinoAI está rodando na Oracle Cloud Free Tier com deploy automatizado!
#!/bin/bash

# DietTreinoAI - Script de Deploy Automatizado para Oracle Cloud
# Este script automatiza o deploy do backend na Oracle Cloud Free Tier

set -e

# Configurações
REMOTE_USER="ubuntu"
REMOTE_HOST=""  # Insira o IP da sua instância Oracle Cloud
APP_DIR="/home/ubuntu/dietreinoAI"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se o IP do servidor foi configurado
check_config() {
    if [ -z "$REMOTE_HOST" ]; then
        error "Configure o IP da sua instância Oracle Cloud na variável REMOTE_HOST"
    fi
    
    if [ ! -f ".env.prod" ]; then
        warning "Arquivo .env.prod não encontrado. Criando template..."
        create_env_template
    fi
}

# Criar template do arquivo .env.prod
create_env_template() {
    cat > .env.prod << EOF
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
EOF
    info "Template .env.prod criado. Configure as variáveis antes de continuar."
    exit 1
}

# Verificar dependências locais
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado"
    fi
    
    if ! command -v ssh &> /dev/null; then
        error "SSH não está disponível"
    fi
    
    if ! command -v rsync &> /dev/null; then
        error "rsync não está instalado"
    fi
}

# Testar conexão SSH
test_ssh_connection() {
    log "Testando conexão SSH com $REMOTE_USER@$REMOTE_HOST..."
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_USER@$REMOTE_HOST" exit 2>/dev/null; then
        error "Não foi possível conectar via SSH. Verifique:\n- IP da instância\n- Chave SSH configurada\n- Grupo de segurança permite SSH (porta 22)"
    fi
    
    log "Conexão SSH OK ✓"
}

# Preparar arquivos para upload
prepare_files() {
    log "Preparando arquivos para deploy..."
    
    # Criar diretório temporário
    mkdir -p .deploy-temp
    
    # Copiar arquivos necessários
    cp -r backend .deploy-temp/
    cp docker-compose.prod.yml .deploy-temp/
    cp -r nginx .deploy-temp/
    cp .env.prod .deploy-temp/.env
    
    # Limpar arquivos desnecessários
    rm -rf .deploy-temp/backend/node_modules
    rm -rf .deploy-temp/backend/dist
    rm -rf .deploy-temp/backend/temp
    
    log "Arquivos preparados ✓"
}

# Enviar arquivos para o servidor
upload_files() {
    log "Enviando arquivos para o servidor..."
    
    # Criar diretório no servidor se não existir
    ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $APP_DIR"
    
    # Sincronizar arquivos
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'dist' \
        --exclude 'temp' \
        .deploy-temp/ "$REMOTE_USER@$REMOTE_HOST:$APP_DIR/"
    
    log "Arquivos enviados ✓"
}

# Instalar dependências no servidor
install_dependencies_remote() {
    log "Instalando dependências no servidor..."
    
    ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
        # Atualizar sistema
        sudo apt update
        
        # Instalar Docker se não estiver instalado
        if ! command -v docker &> /dev/null; then
            echo "Instalando Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        fi
        
        # Instalar Docker Compose se não estiver instalado
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            echo "Instalando Docker Compose..."
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
        
        echo "Dependências instaladas ✓"
ENDSSH
    
    log "Dependências instaladas no servidor ✓"
}

# Deploy da aplicação
deploy_application() {
    log "Realizando deploy da aplicação..."
    
    ssh "$REMOTE_USER@$REMOTE_HOST" << ENDSSH
        cd $APP_DIR
        
        # Parar containers existentes
        if [ -f "$DOCKER_COMPOSE_FILE" ]; then
            docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
        fi
        
        # Limpar imagens antigas
        docker system prune -f
        
        # Build e start dos containers
        docker-compose -f $DOCKER_COMPOSE_FILE up --build -d
        
        # Aguardar serviços ficarem prontos
        echo "Aguardando serviços ficarem prontos..."
        sleep 30
        
        # Executar migrações do banco
        echo "Executando migrações do banco..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T backend npm run migration:run || true
        
        # Verificar status dos containers
        docker-compose -f $DOCKER_COMPOSE_FILE ps
ENDSSH
    
    log "Deploy concluído ✓"
}

# Verificar saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar um pouco mais para os serviços ficarem prontos
    sleep 10
    
    # Testar endpoint GraphQL
    if curl -f -s "http://$REMOTE_HOST:3000/graphql" > /dev/null 2>&1; then
        log "Aplicação está respondendo ✓"
    else
        warning "Aplicação pode não estar respondendo corretamente"
        info "Verifique os logs com: ssh $REMOTE_USER@$REMOTE_HOST 'cd $APP_DIR && docker-compose -f $DOCKER_COMPOSE_FILE logs'"
    fi
}

# Cleanup
cleanup() {
    log "Limpando arquivos temporários..."
    rm -rf .deploy-temp
    log "Cleanup concluído ✓"
}

# Função principal
main() {
    info "=== DietTreinoAI - Deploy Automatizado ==="
    
    check_config
    check_dependencies
    test_ssh_connection
    prepare_files
    upload_files
    install_dependencies_remote
    deploy_application
    health_check
    cleanup
    
    log "🎉 Deploy concluído com sucesso!"
    info "Sua aplicação está rodando em: http://$REMOTE_HOST:3000/graphql"
    info "Para verificar logs: ssh $REMOTE_USER@$REMOTE_HOST 'cd $APP_DIR && docker-compose -f $DOCKER_COMPOSE_FILE logs -f'"
}

# Tratamento de erros
trap 'error "Deploy falhou! Verifique os logs acima."' ERR
trap 'cleanup' EXIT

# Executar script principal
main "$@"
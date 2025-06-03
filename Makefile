# DietTreinoAI - Makefile para comandos Docker

.PHONY: help build up down logs clean dev prod mobile tools migrate generate test

# Variáveis
COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = docker-compose.prod.yml

# Help
help: ## Mostra esta ajuda
	@echo "DietTreinoAI - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Comandos de desenvolvimento
dev: ## Inicia todos os serviços em modo desenvolvimento
	docker-compose -f $(COMPOSE_FILE) up -d backend frontend mobile-web postgres
	@echo "🚀 Serviços iniciados:"
	@echo "   Backend:  http://localhost:3000"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Mobile:   http://localhost:19006"

dev-full: ## Inicia todos os serviços incluindo mobile-dev
	docker-compose -f $(COMPOSE_FILE) --profile mobile-dev up -d
	@echo "🚀 Todos os serviços iniciados!"

up: ## Inicia os serviços principais
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Para todos os serviços
	docker-compose -f $(COMPOSE_FILE) down

# Comandos de produção
prod: ## Inicia em modo produção
	docker-compose -f $(COMPOSE_PROD_FILE) up -d
	@echo "🚀 Produção iniciada!"

prod-build: ## Build e inicia em produção
	docker-compose -f $(COMPOSE_PROD_FILE) up -d --build

# Comandos de build
build: ## Faz build de todas as imagens
	docker-compose -f $(COMPOSE_FILE) build

build-no-cache: ## Faz build sem cache
	docker-compose -f $(COMPOSE_FILE) build --no-cache

# Logs
logs: ## Mostra logs de todos os serviços
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Mostra logs do backend
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Mostra logs do frontend
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

logs-mobile: ## Mostra logs do mobile
	docker-compose -f $(COMPOSE_FILE) logs -f mobile-web

# Serviços específicos
backend: ## Inicia apenas backend e banco
	docker-compose -f $(COMPOSE_FILE) up -d backend postgres

frontend: ## Inicia frontend, backend e banco
	docker-compose -f $(COMPOSE_FILE) up -d frontend backend postgres

mobile: ## Inicia mobile-web em modo desenvolvimento
	docker-compose -f $(COMPOSE_FILE) --profile mobile-dev up -d mobile-dev backend postgres

tools: ## Inicia ferramentas (PgAdmin)
	docker-compose -f $(COMPOSE_FILE) --profile tools up -d pgadmin
	@echo "🔧 PgAdmin: http://localhost:5050 (admin@admin.com / admin)"

# Database
migrate: ## Executa migrações do banco
	docker-compose -f $(COMPOSE_FILE) exec backend npm run migration:run

migrate-generate: ## Gera nova migração
	@read -p "Nome da migração: " name; \
	docker-compose -f $(COMPOSE_FILE) exec backend npm run migration:generate --name=$$name

db-reset: ## Reseta o banco (CUIDADO!)
	docker-compose -f $(COMPOSE_FILE) down -v
	docker-compose -f $(COMPOSE_FILE) up -d postgres
	sleep 5
	$(MAKE) migrate

# Desenvolvimento
generate: ## Gera tipos GraphQL no frontend e mobile
	docker-compose -f $(COMPOSE_FILE) exec frontend npm run generate
	docker-compose -f $(COMPOSE_FILE) exec mobile-web npm run generate

install: ## Instala dependências em todos os projetos
	docker-compose -f $(COMPOSE_FILE) exec backend npm install
	docker-compose -f $(COMPOSE_FILE) exec frontend npm install
	docker-compose -f $(COMPOSE_FILE) exec mobile-web npm install

# Testes
test: ## Executa testes
	docker-compose -f $(COMPOSE_FILE) exec backend npm run test

test-e2e: ## Executa testes e2e
	docker-compose -f $(COMPOSE_FILE) exec backend npm run test:e2e

test-frontend: ## Executa testes do frontend
	docker-compose -f $(COMPOSE_FILE) exec frontend npm run test

# Limpeza
clean: ## Para e remove todos os containers e volumes
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker-compose -f $(COMPOSE_PROD_FILE) down -v --remove-orphans 2>/dev/null || true

clean-images: ## Remove imagens não utilizadas
	docker image prune -f

clean-all: ## Limpeza completa (containers, volumes, imagens)
	$(MAKE) clean
	docker system prune -af

# Status
status: ## Mostra status dos containers
	docker-compose -f $(COMPOSE_FILE) ps

# Setup inicial
setup: ## Setup inicial do projeto
	@echo "🔧 Configurando DietTreinoAI..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📋 Arquivo .env criado. Edite-o com suas configurações."; \
	fi
	$(MAKE) build
	$(MAKE) dev
	sleep 10
	$(MAKE) migrate
	$(MAKE) generate
	@echo "✅ Setup concluído!"
	@echo ""
	@echo "🚀 Acesse:"
	@echo "   Backend:  http://localhost:3000/graphql"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Mobile:   http://localhost:19006"

# Comandos úteis
shell-backend: ## Acessa shell do container backend
	docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Acessa shell do container frontend
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-mobile: ## Acessa shell do container mobile
	docker-compose -f $(COMPOSE_FILE) exec mobile-web sh

# Default
.DEFAULT_GOAL := help
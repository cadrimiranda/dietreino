# Frontend Vue.js Dockerfile
FROM node:18-alpine AS development

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de configuração
COPY frontend/package*.json ./
COPY frontend/codegen.yml ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY frontend/ .

# Gerar tipos GraphQL
RUN npm run generate

# Expor porta
EXPOSE 5173

# Comando para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Estágio de produção
FROM node:18-alpine AS production

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de configuração
COPY frontend/package*.json ./
COPY frontend/codegen.yml ./

# Instalar dependências incluindo devDependencies para build
RUN npm install

# Copiar código fonte
COPY frontend/ .

# Gerar tipos GraphQL e build
RUN npm run generate
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["serve", "-s", "dist", "-l", "3000"]
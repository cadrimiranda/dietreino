# Mobile React Native/Expo Dockerfile
FROM node:18-alpine AS development

# Instalar Expo CLI globalmente
RUN npm install -g @expo/cli

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de configuração
COPY mobile/package*.json ./
COPY mobile/codegen.yml ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY mobile/ .

# Gerar tipos GraphQL
RUN npm run generate

# Expor portas do Expo
EXPOSE 8081 19000 19001 19002

# Comando para desenvolvimento
CMD ["npx", "expo", "start", "--tunnel"]

# Estágio para web
FROM node:18-alpine AS web

# Instalar Expo CLI globalmente
RUN npm install -g @expo/cli

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY codegen.yml ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar tipos GraphQL
RUN npm run generate

# Expor porta para web
EXPOSE 19006

# Comando para web
CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0"]
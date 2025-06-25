# Plano de Migração: Histórico de Treinos Frontend

Este documento detalha o passo a passo para migrar o sistema de histórico de treinos no frontend de dados mock/falsos para dados reais vindos do backend.

## 📋 Situação Atual

### ✅ O que já está funcionando:
1. **Backend completo implementado:**
   - Entidades: `WorkoutHistory`, `WorkoutHistoryExercise`, `WorkoutHistoryExerciseSet`
   - Resolvers GraphQL: `workoutHistories`, `workoutHistoriesByUser`, `workoutHistoriesByWorkout`
   - Mutation `createWorkoutHistory` funcionando (testado no mobile)
   - Service completo com todas as operações CRUD

2. **Frontend estrutura base:**
   - Types TypeScript definidos (`/src/types/workoutHistory.ts`)
   - Queries GraphQL definidas (`/src/graphql/workoutHistory.ts`)
   - Composable `useWorkoutHistory` implementado
   - Componentes de visualização criados
   - Dashboard completo com filtros e analytics

3. **Mobile funcionando:**
   - Salvamento de histórico implementado e testado
   - IDs de exercícios corrigidos
   - Dados sendo salvos corretamente no banco

### ❌ Problemas identificados:
1. **Frontend não está usando dados reais:**
   - `WorkoutHistoryView.vue` tem mock do usuário atual (linha 58-61)
   - Falta integração com sistema de autenticação
   - Possivelmente componentes internos ainda usando dados mock

## 🎯 Plano de Migração (8 etapas)

### Etapa 1: Verificar e Corrigir Autenticação
**Objetivo:** Garantir que o sistema de auth está funcionando no frontend

**Passos:**
1. Verificar se existe store/composable de autenticação
2. Verificar se o token JWT está sendo enviado nas requests
3. Corrigir `WorkoutHistoryView.vue` para usar usuário real em vez de mock
4. Testar queries GraphQL no Apollo Studio/DevTools

**Arquivos a verificar:**
- `/src/stores/auth.ts` ou `/src/composables/useAuth.ts`
- `/src/apollo.ts` (configuração de headers de autenticação)
- `/src/views/WorkoutHistoryView.vue` (remover mock)

### Etapa 2: Gerar Types GraphQL
**Objetivo:** Garantir que os types do frontend estão sincronizados com o backend

**Passos:**
```bash
cd frontend
npm run generate
```

**Verificar:**
- Se os types gerados em `/src/generated/graphql.ts` estão corretos
- Se não há conflitos entre types manuais e gerados
- Se todas as queries/mutations estão tipadas

### Etapa 3: Testar Queries Básicas
**Objetivo:** Validar se as queries GraphQL funcionam com dados reais

**Passos:**
1. Testar `workoutHistoriesByUser` com ID de usuário real
2. Verificar se dados estão sendo retornados corretamente
3. Validar estrutura de dados vs. types esperados

**Como testar:**
```javascript
// No Apollo DevTools ou código temporário
query GetWorkoutHistoriesByUser($userId: ID!) {
  workoutHistoriesByUser(userId: $userId) {
    id
    workoutName
    executedAt
    workoutHistoryExercises {
      exerciseName
      workoutHistoryExerciseSets {
        weight
        reps
      }
    }
  }
}
```

### Etapa 4: Corrigir WorkoutHistoryView.vue
**Objetivo:** Remover dados mock e integrar com sistema de auth real

**Mudanças necessárias:**
```vue
<!-- ANTES (linha 58-61) -->
const currentUser = ref({
  id: 'current-user-id',
  role: 'TRAINER' // or 'CLIENT'
});

<!-- DEPOIS -->
import { useAuth } from '@/composables/useAuth'; // ou store
const { user: currentUser } = useAuth();
```

**Validar:**
- Usuário logado carrega seus próprios dados
- Trainers veem lista de clientes
- Filtros padrão funcionam corretamente

### Etapa 5: Verificar Componentes Internos
**Objetivo:** Garantir que todos os componentes filhos usam dados reais

**Componentes a verificar:**
- `/src/components/workout-history/WorkoutHistoryDashboard.vue`
- `/src/components/workout-history/ExerciseProgressChart.vue`
- `/src/components/workout-history/WorkoutHistoryFilters.vue`

**Procurar por:**
- Dados hardcoded ou mock
- Funções que geram dados falsos
- Comentários indicando dados temporários

### Etapa 6: Testar Filtros e Analytics
**Objetivo:** Validar se todos os filtros e cálculos funcionam com dados reais

**Testar:**
1. Filtro por usuário (se trainer)
2. Filtro por workout
3. Filtro por exercício
4. Filtro por data
5. Analytics computados (volume, progresso, etc.)

**Verificar:**
- Performance com datasets maiores
- Cálculos de analytics estão corretos
- Gráficos renderizam corretamente

### Etapa 7: Tratamento de Estados Especiais
**Objetivo:** Garantir UX adequada para diferentes cenários

**Cenários a implementar:**
1. **Usuário sem histórico:** Mostrar estado vazio incentivando primeiro treino
2. **Dados carregando:** Loading states adequados
3. **Erro de rede:** Retry e mensagens de erro
4. **Filtros sem resultado:** Sugestões para ajustar filtros

### Etapa 8: Testes e Refinamentos
**Objetivo:** Validar sistema completo e otimizar performance

**Checklist final:**
- [ ] Login/logout mantém estado correto
- [ ] Dados atualizam em tempo real após novos treinos
- [ ] Filtros funcionam corretamente
- [ ] Analytics calculam valores corretos
- [ ] Performance adequada (< 2s para carregar)
- [ ] Responsividade mobile
- [ ] Tratamento de erros completo

## 🔧 Comandos Úteis

### Para testar durante desenvolvimento:
```bash
# Frontend - gerar types
cd frontend && npm run generate

# Backend - verificar schema
cd backend && npm run start:dev

# Mobile - testar criação de histórico
cd mobile && npx expo start
```

### Para debug de GraphQL:
1. Acessar Apollo Studio: `http://localhost:3000/graphql`
2. DevTools do browser: Network tab para ver requests
3. Vue DevTools: Apollo tab para ver cache

## ⚠️ Pontos de Atenção

### Segurança:
- Validar que usuários só veem seus próprios dados
- Trainers só veem dados de seus clientes
- Verificar autorização em todas as queries

### Performance:
- Implementar paginação se necessário
- Cache adequado para queries frequentes
- Lazy loading de gráficos pesados

### UX:
- Loading states durante fetch
- Skeleton screens para melhor percepção
- Feedback visual para ações do usuário

## 🏁 Critério de Sucesso

O frontend estará totalmente migrado quando:

1. ✅ Nenhum dado mock/hardcoded presente
2. ✅ Usuários reais carregam seus históricos reais
3. ✅ Filtros funcionam com dados do backend
4. ✅ Analytics mostram valores corretos
5. ✅ Performance adequada (< 3s total)
6. ✅ Estados de erro/vazio tratados
7. ✅ Integração completa com autenticação
8. ✅ Dados sincronizam após novos treinos do mobile

## 📝 Próximos Passos Recomendados

Após a migração básica, considerar:

1. **Cache inteligente:** Implementar cache com TTL para históricos
2. **Real-time updates:** WebSockets para atualização automática
3. **Exportação:** Funcionalidade de export PDF/Excel
4. **Comparações:** Comparar períodos diferentes
5. **Metas:** Sistema de objetivos e acompanhamento
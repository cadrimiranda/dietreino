# Entidades de Histórico de Treinos

## Visão Geral
Sistema de histórico de treinos que permite aos usuários registrar e acompanhar o desempenho de seus treinos executados, mantendo um registro detalhado de cargas, repetições e anotações pessoais.

## Entidades Criadas

### 1. WorkoutHistory
**Arquivo**: `workout-history.entity.ts`  
**Tabela**: `workout_history`

Registra cada execução de um treino pelo usuário.

**Campos**:
- `user`: Relação com User (quem executou o treino)
- `workout`: Relação com Workout (treino que foi executado)
- `executedAt`: Data e hora da execução do treino
- `workoutName`: Nome do treino no momento da execução (snapshot)
- `trainingDayOrder`: Ordem do dia de treino executado
- `trainingDayName`: Nome do dia de treino (snapshot)
- `notes`: Anotações gerais sobre o treino
- `durationMinutes`: Duração total do treino em minutos
- `workoutHistoryExercises`: Lista de exercícios executados

**Relacionamentos**:
- `ManyToOne` com User
- `ManyToOne` com Workout
- `OneToMany` com WorkoutHistoryExercise

### 2. WorkoutHistoryExercise
**Arquivo**: `workout-history-exercise.entity.ts`  
**Tabela**: `workout_history_exercises`

Registra cada exercício executado dentro de um treino histórico.

**Campos**:
- `workoutHistory`: Relação com WorkoutHistory
- `exercise`: Relação com Exercise
- `order`: Ordem do exercício no treino
- `exerciseName`: Nome do exercício (snapshot)
- `plannedSets`: Número de séries planejadas
- `completedSets`: Número de séries efetivamente completadas
- `notes`: Anotações sobre o exercício
- `workoutHistoryExerciseSets`: Lista de séries executadas

**Relacionamentos**:
- `ManyToOne` com WorkoutHistory (CASCADE)
- `ManyToOne` com Exercise
- `OneToMany` com WorkoutHistoryExerciseSet

### 3. WorkoutHistoryExerciseSet
**Arquivo**: `workout-history-exercise-set.entity.ts`  
**Tabela**: `workout_history_exercise_sets`

Registra cada série individual executada, com detalhes de peso, repetições e anotações.

**Campos**:
- `workoutHistoryExercise`: Relação com WorkoutHistoryExercise
- `setNumber`: Número da série (1, 2, 3...)
- `weight`: Peso utilizado (decimal 8,2)
- `reps`: Repetições efetivamente realizadas
- `plannedRepsMin`: Repetições mínimas planejadas
- `plannedRepsMax`: Repetições máximas planejadas
- `restSeconds`: Tempo de descanso após a série
- `isCompleted`: Se a série foi completada conforme planejado
- `isFailure`: Se houve falha durante a série
- `notes`: Anotações específicas da série
- `executedAt`: Timestamp de quando a série foi executada

**Relacionamentos**:
- `ManyToOne` com WorkoutHistoryExercise (CASCADE)

## Exemplo de Uso

Para o cenário descrito (supino reto, 3 séries de 10-12 repetições):

```
WorkoutHistory {
  user: "user-id",
  workout: "workout-id", 
  executedAt: "2024-01-15T10:00:00Z",
  workoutName: "Treino A - Peito e Tríceps",
  trainingDayOrder: 1,
  trainingDayName: "Segunda - Peito",
  notes: "Treino pesado hoje"
}

WorkoutHistoryExercise {
  exercise: "supino-reto-id",
  exerciseName: "Supino Reto",
  order: 1,
  plannedSets: 3,
  completedSets: 3,
  notes: "Boa execução geral"
}

WorkoutHistoryExerciseSet (série 1) {
  setNumber: 1,
  weight: 80.00,
  reps: 12,
  plannedRepsMin: 10,
  plannedRepsMax: 12,
  isCompleted: true,
  isFailure: false,
  notes: "Primeira série boa"
}

WorkoutHistoryExerciseSet (série 2) {
  setNumber: 2,
  weight: 80.00,
  reps: 11,
  plannedRepsMin: 10,
  plannedRepsMax: 12,
  isCompleted: true,
  isFailure: false,
  notes: "Segunda mais pesada"
}

WorkoutHistoryExerciseSet (série 3) {
  setNumber: 3,
  weight: 80.00,
  reps: 9,
  plannedRepsMin: 10,
  plannedRepsMax: 12,
  isCompleted: false,
  isFailure: true,
  notes: "Falhei com 9, músculo já estava fatigado"
}
```

## Características do Sistema

1. **Persistência**: Dados mantidos mesmo após workout inativo
2. **Snapshots**: Nomes e configurações salvas no momento da execução
3. **Flexibilidade**: Permite anotações em todos os níveis (treino, exercício, série)
4. **Rastreamento**: Controle de séries completadas vs planejadas
5. **Timestamps**: Registro preciso de quando cada ação foi executada
6. **Cascata**: Exclusões em cascata para manter integridade referencial

## Implementação Completa ✅

### 1. Migrations ✅
**Arquivo**: `1748527130280-CreateWorkoutHistoryTables.ts`
- Criação das 3 tabelas do sistema de histórico
- Foreign keys com cascata para integridade referencial  
- Índices para otimização de consultas por usuário e data
- Comando: `npm run migration:run` para aplicar

### 2. Resolvers GraphQL ✅
**Módulo**: `workout-history.module.ts`
- **Queries**: 
  - `workoutHistories`: Lista todos os históricos
  - `workoutHistory(id)`: Busca por ID
  - `workoutHistoriesByUser(userId)`: Históricos por usuário
  - `workoutHistoriesByWorkout(workoutId)`: Históricos por treino
- **Mutations**:
  - `createWorkoutHistory`: Criação completa com transação
  - `deleteWorkoutHistory`: Remoção com cascata

### 3. DTOs e Validações ✅
**Arquivos**: `dto/*.input.ts` e `dto/*.type.ts`
- **Input DTOs**: Para criação de histórico, exercícios e séries
- **Output Types**: Para resposta GraphQL  
- **Validações**:
  - Campos obrigatórios e opcionais
  - Limites numéricos (peso: 0-1000kg, reps: 0-200, séries: 1-20)
  - Validações de negócio:
    - `completedSets ≤ plannedSets`
    - `plannedRepsMax ≥ plannedRepsMin`
  - Formato de datas e strings

### 4. Serviços de Negócio ✅
**Arquivo**: `workout-history.service.ts`
- **Repository Pattern**: Abstração da camada de dados
- **Transações**: Criação atômica de histórico completo
- **Relacionamentos**: Carregamento otimizado com joins
- **Transformações**: Conversão entre entidades e tipos GraphQL
- **Error Handling**: Tratamento de erros com NotFoundException

### 5. Testes ✅
**Arquivos**: `tests/*.spec.ts`
- **Testes Unitários**: 
  - Todas as operações CRUD
  - Mocking de dependências
  - Casos de erro e sucesso
- **Testes de Integração**:
  - TestContainers com PostgreSQL real
  - Fluxo completo de criação com cascata
  - Validação de relacionamentos
  - Testes de resolvers GraphQL

### 6. Segurança e Autorização ✅
- **Guards**: GqlAuthGuard para autenticação
- **Roles**: CLIENT e TRAINER podem criar/deletar históricos
- **Validação**: Entrada sanitizada e validada

## Funcionalidades Implementadas

### Criação de Histórico
```graphql
mutation CreateWorkoutHistory($input: CreateWorkoutHistoryInput!) {
  createWorkoutHistory(createWorkoutHistoryInput: $input) {
    id
    workoutName
    executedAt
    durationMinutes
    workoutHistoryExercises {
      exerciseName
      completedSets
      workoutHistoryExerciseSets {
        weight
        reps
        isCompleted
        isFailure
      }
    }
  }
}
```

### Consultas Disponíveis
```graphql
# Histórico por usuário
query WorkoutHistoriesByUser($userId: ID!) {
  workoutHistoriesByUser(userId: $userId) {
    id
    executedAt
    workoutName
    durationMinutes
  }
}

# Histórico específico
query WorkoutHistory($id: ID!) {
  workoutHistory(id: $id) {
    id
    executedAt
    workoutName
    notes
    workoutHistoryExercises {
      exerciseName
      plannedSets
      completedSets
      workoutHistoryExerciseSets {
        setNumber
        weight
        reps
        isCompleted
        isFailure
        notes
      }
    }
  }
}
```

## Como Usar

1. **Aplicar Migration**: `npm run migration:run`
2. **Reiniciar Server**: Para carregar novo módulo GraphQL  
3. **Testar**: `npm run test` para validar implementação
4. **GraphQL Playground**: Disponível em `/graphql` para testes

## Próximos Passos Opcionais

1. **Analytics**: Queries agregadas para estatísticas de performance
2. **Exportação**: Relatórios em PDF/Excel dos históricos  
3. **Comparação**: Sistema para comparar performances entre treinos
4. **Metas**: Tracking de objetivos e progressão
5. **Notificações**: Alertas de performance e lembretes
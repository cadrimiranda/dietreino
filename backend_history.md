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

## Próximos Passos

1. Criar migrations para as novas tabelas
2. Implementar resolvers GraphQL
3. Criar DTOs para criação/atualização 
4. Implementar serviços de negócio
5. Adicionar validações e constraints
6. Criar testes unitários e de integração
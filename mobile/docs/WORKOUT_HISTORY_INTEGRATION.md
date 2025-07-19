# Integração do Histórico de Treinos

Esta documentação descreve a integração completa entre o componente `ExerciseExecution` do mobile e o módulo `workout-history` do backend.

## Arquitetura da Integração

### 1. Fluxo de Dados

```
Mobile App → WorkoutHistoryMapper → GraphQL Mutation → Backend → Database
```

### 2. Componentes Principais

#### Backend
- **WorkoutHistory**: Entidade principal que armazena dados gerais do treino
- **WorkoutHistoryExercise**: Dados específicos de cada exercício
- **WorkoutHistoryExerciseSet**: Dados detalhados de cada série executada

#### Mobile
- **ExerciseExecution.tsx**: Componente de execução de exercícios
- **useWorkoutHistory.ts**: Hook para salvar histórico via GraphQL
- **WorkoutHistoryMapper.ts**: Utilitário para conversão de dados

## Dados Capturados

### Dados do Treino
- ID do usuário e do treino
- Nome do treino e dia de treino
- Data/hora de execução
- Duração total do treino
- Anotações gerais

### Dados dos Exercícios
- Nome e ID do exercício
- Séries planejadas vs executadas
- Ordem de execução
- Anotações específicas

### Dados das Séries
- Número da série
- Peso utilizado
- Repetições executadas
- Repetições planejadas (min/max)
- Tempo de descanso
- Status de conclusão
- Data/hora de execução

## Como Usar

### 1. Durante a Execução

O componente `ExerciseExecution` automaticamente:
- Captura dados de peso e repetições
- Persiste informações entre exercícios
- Gerencia estado de conclusão

### 2. Ao Finalizar o Treino

Quando todos os exercícios são concluídos:
1. Sistema oferece opção de salvar histórico
2. Dados são mapeados para formato do backend
3. Enviados via GraphQL mutation
4. Feedback visual é exibido

### 3. Exemplo de Código

```typescript
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { WorkoutHistoryMapper } from '@/utils/workoutHistoryMapper';

const { saveWorkoutHistory, loading, error, success } = useWorkoutHistory();

const handleSaveHistory = async () => {
  const executionData = {
    userId: user.id,
    workoutId: activeWorkout.id,
    workoutName: activeWorkout.name,
    trainingDayName,
    trainingDayOrder: 1,
    exercises,
    executedSets: allExerciseSets,
    exerciseNotes: allExerciseNotes,
    startTime: workoutStartTime,
    endTime: new Date(),
  };

  const historyData = WorkoutHistoryMapper.mapToWorkoutHistory(executionData);
  await saveWorkoutHistory(historyData);
};
```

## Estrutura dos Dados

### Interface WorkoutHistoryData

```typescript
interface WorkoutHistoryData {
  userId: string;
  workoutId: string;
  executedAt: Date;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  notes?: string;
  durationMinutes?: number;
  exercises: WorkoutHistoryExercise[];
}
```

### Interface WorkoutHistoryExercise

```typescript
interface WorkoutHistoryExercise {
  exerciseId: string;
  exerciseName: string;
  order: number;
  plannedSets: number;
  completedSets: number;
  notes?: string;
  sets: WorkoutHistorySet[];
}
```

### Interface WorkoutHistorySet

```typescript
interface WorkoutHistorySet {
  setNumber: number;
  weight?: number;
  reps: number;
  plannedRepsMin?: number;
  plannedRepsMax?: number;
  restSeconds?: number;
  isCompleted: boolean;
  isFailure: boolean;
  notes?: string;
  executedAt: Date;
}
```

## Mapeamento de Dados

### Parser de Repetições

Converte strings como:
- `"8-12"` → `{ plannedRepsMin: 8, plannedRepsMax: 12 }`
- `"10"` → `{ plannedRepsMin: 10, plannedRepsMax: 10 }`
- `"8 - 12"` → `{ plannedRepsMin: 8, plannedRepsMax: 12 }`

### Parser de Tempo de Descanso

Converte strings como:
- `"90s"` → `90` segundos
- `"2m"` → `120` segundos
- `"1m30s"` → `90` segundos
- `"90"` → `90` segundos

## Estados da Interface

### Estados de Salvamento
- **loading**: Salvando histórico no backend
- **success**: Histórico salvo com sucesso
- **error**: Erro ao salvar histórico

### Feedback Visual
- Card azul para estado de loading
- Card verde para sucesso
- Card vermelho para erro

## Tratamento de Erros

### Validação
- Verifica campos obrigatórios
- Valida estrutura dos dados
- Trata valores inválidos graciosamente

### Recuperação
- Oferece opção de tentar novamente
- Mantém dados localmente em caso de erro
- Permite pular salvamento se necessário

## Testes

### Cobertura de Testes
- **Unitários**: WorkoutHistoryMapper (18 testes)
- **Integração**: Fluxo completo de dados (11 testes)
- **Validação**: Interfaces e tipos (12 testes)

### Executar Testes
```bash
cd mobile
npm test -- --testPathPattern="workoutHistory"
```

## Arquivos Relacionados

### Mobile
- `components/exercise/ExerciseExecution.tsx`
- `hooks/useWorkoutHistory.ts`
- `utils/workoutHistoryMapper.ts`
- `__tests__/utils/workoutHistoryMapper.test.ts`
- `__tests__/hooks/useWorkoutHistory.unit.test.ts`
- `__tests__/integration/workoutHistoryFlow.test.ts`

### Backend
- `src/modules/workout-history/`
- `src/entities/workout-history.entity.ts`
- `src/entities/workout-history-exercise.entity.ts`
- `src/entities/workout-history-exercise-set.entity.ts`

## Considerações de Performance

### Otimizações
- Estados persistidos em Maps para eficiência
- Dados salvos apenas ao finalizar treino
- Validação client-side antes do envio

### Escalabilidade
- Suporte a múltiplos exercícios
- Flexível para diferentes tipos de treino
- Extensível para novos campos

## Próximos Passos

### Melhorias Futuras
1. **Sincronização offline**: Cache local para envio posterior
2. **Análise de dados**: Métricas e relatórios
3. **Comparação histórica**: Progresso ao longo do tempo
4. **Exportação**: Dados em diferentes formatos
5. **Notificações**: Lembretes e conquistas
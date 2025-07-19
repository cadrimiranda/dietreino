<template>
  <div class="exercise-progress-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ exerciseData.exerciseName }}</h3>
      <div class="chart-metrics">
        <div class="metric">
          <span class="metric-label">Sessões</span>
          <span class="metric-value">{{ exerciseData.sessions.length }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Peso Máx</span>
          <span class="metric-value">{{ maxWeight }}kg</span>
        </div>
        <div class="metric">
          <span class="metric-label">Volume Total</span>
          <span class="metric-value">{{ totalVolume }}kg</span>
        </div>
      </div>
    </div>

    <div class="chart-tabs">
      <button 
        v-for="tab in chartTabs" 
        :key="tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="chart-container">
      <!-- Weight Progress Chart -->
      <div v-if="activeTab === 'weight'" class="chart-content">
        <div class="chart-grid">
          <div v-for="(session, index) in exerciseData.sessions" :key="index" class="session-bar">
            <div class="session-date">{{ formatDate(session.date) }}</div>
            <div class="sets-container">
              <div 
                v-for="set in session.sets" 
                :key="set.setNumber"
                :class="['set-bar', { completed: set.isCompleted }]"
                :style="{ height: `${getWeightPercentage(set.weight || 0)}%` }"
                :title="`Série ${set.setNumber}: ${set.weight || 0}kg x ${set.reps} reps`"
              >
                <span class="set-label">{{ set.weight || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Volume Progress Chart -->
      <div v-if="activeTab === 'volume'" class="chart-content">
        <div class="volume-chart">
          <div v-for="(session, index) in exerciseData.sessions" :key="index" class="volume-bar">
            <div 
              class="volume-fill"
              :style="{ height: `${getVolumePercentage(session.totalVolume)}%` }"
              :title="`${formatDate(session.date)}: ${session.totalVolume}kg total`"
            ></div>
            <div class="volume-label">{{ formatDate(session.date, 'short') }}</div>
          </div>
        </div>
      </div>

      <!-- Reps Progress Chart -->
      <div v-if="activeTab === 'reps'" class="chart-content">
        <div class="reps-chart">
          <div v-for="(session, index) in exerciseData.sessions" :key="index" class="reps-session">
            <div class="reps-date">{{ formatDate(session.date) }}</div>
            <div class="reps-sets">
              <span 
                v-for="set in session.sets" 
                :key="set.setNumber"
                :class="['rep-count', { completed: set.isCompleted }]"
              >
                {{ set.reps }}
              </span>
            </div>
            <div class="reps-average">Avg: {{ session.averageReps.toFixed(1) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div :class="['trend-badge', progressTrend]">
        <span class="trend-icon">
          {{ progressTrend === 'increasing' ? '↗️' : progressTrend === 'decreasing' ? '↘️' : '➡️' }}
        </span>
        <span class="trend-text">
          {{ progressTrend === 'increasing' ? 'Progredindo' : 
             progressTrend === 'decreasing' ? 'Regredindo' : 'Estável' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExerciseProgressData } from '@/types/workoutHistory';

interface Props {
  exerciseData: ExerciseProgressData;
}

const props = defineProps<Props>();

const activeTab = ref<'weight' | 'volume' | 'reps'>('weight');

const chartTabs = [
  { key: 'weight' as const, label: 'Peso' },
  { key: 'volume' as const, label: 'Volume' },
  { key: 'reps' as const, label: 'Repetições' }
];

const maxWeight = computed(() => {
  const weights = props.exerciseData.sessions.flatMap(s => s.sets.map(set => set.weight || 0));
  return weights.length > 0 ? Math.max(...weights) : 0;
});

const maxVolume = computed(() => {
  const volumes = props.exerciseData.sessions.map(s => s.totalVolume);
  return volumes.length > 0 ? Math.max(...volumes) : 0;
});

const totalVolume = computed(() => {
  return props.exerciseData.sessions.reduce((sum, s) => sum + s.totalVolume, 0);
});

const progressTrend = computed(() => {
  const sessions = props.exerciseData.sessions;
  if (sessions.length < 2) return 'stable';
  
  const recentSessions = sessions.slice(-3);
  const volumes = recentSessions.map(s => s.totalVolume);
  const trend = volumes[volumes.length - 1] - volumes[0];
  
  if (trend > 0) return 'increasing';
  if (trend < 0) return 'decreasing';
  return 'stable';
});

function getWeightPercentage(weight: number): number {
  return maxWeight.value > 0 ? (weight / maxWeight.value) * 100 : 0;
}

function getVolumePercentage(volume: number): number {
  return maxVolume.value > 0 ? (volume / maxVolume.value) * 100 : 0;
}

function formatDate(dateString: string, format: 'full' | 'short' = 'full'): string {
  const date = new Date(dateString);
  if (format === 'short') {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    year: '2-digit'
  });
}
</script>

<style scoped>
.exercise-progress-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-metrics {
  display: flex;
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.metric-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.chart-tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-button:hover:not(.active) {
  color: #475569;
}

.chart-container {
  min-height: 200px;
  margin-bottom: 20px;
}

/* Weight Chart Styles */
.chart-grid {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 200px;
  padding: 0 10px;
}

.session-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 60px;
}

.session-date {
  font-size: 10px;
  color: #64748b;
  margin-bottom: 8px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.sets-container {
  display: flex;
  gap: 2px;
  height: 160px;
  align-items: flex-end;
}

.set-bar {
  width: 12px;
  background: #e2e8f0;
  border-radius: 2px;
  position: relative;
  min-height: 4px;
  transition: all 0.2s;
}

.set-bar.completed {
  background: linear-gradient(to top, #3b82f6, #60a5fa);
}

.set-bar:hover {
  opacity: 0.8;
}

.set-label {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #374151;
  font-weight: 500;
}

/* Volume Chart Styles */
.volume-chart {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 200px;
  padding: 20px 0;
}

.volume-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.volume-fill {
  background: linear-gradient(to top, #10b981, #34d399);
  border-radius: 4px;
  width: 100%;
  max-width: 24px;
  min-height: 4px;
  transition: all 0.2s;
}

.volume-fill:hover {
  opacity: 0.8;
}

.volume-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 8px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Reps Chart Styles */
.reps-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.reps-session {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.reps-date {
  font-size: 12px;
  color: #64748b;
  min-width: 60px;
}

.reps-sets {
  display: flex;
  gap: 4px;
  flex: 1;
}

.rep-count {
  padding: 4px 8px;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.rep-count.completed {
  background: #dbeafe;
  color: #3b82f6;
}

.reps-average {
  font-size: 12px;
  color: #64748b;
  min-width: 60px;
  text-align: right;
}

/* Progress Indicator */
.progress-indicator {
  display: flex;
  justify-content: center;
}

.trend-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.trend-badge.increasing {
  background: #dcfce7;
  color: #166534;
}

.trend-badge.decreasing {
  background: #fef2f2;
  color: #dc2626;
}

.trend-badge.stable {
  background: #f1f5f9;
  color: #475569;
}

.trend-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 16px;
  }

  .chart-metrics {
    justify-content: space-around;
    width: 100%;
  }

  .session-date,
  .volume-label {
    writing-mode: horizontal-tb;
    text-orientation: initial;
  }

  .sets-container {
    height: 120px;
  }

  .volume-chart {
    height: 150px;
  }
}
</style>
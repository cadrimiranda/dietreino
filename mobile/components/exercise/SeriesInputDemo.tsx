import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import SeriesInput from './SeriesInput';
import { Exercise, Series } from '@/types/exercise';

// Componente de demonstração do SeriesInput com dados mock
const SeriesInputDemo = () => {
  // Mock de exercício
  const mockExercise: Exercise = {
    id: 'exercise-1',
    name: 'Supino Reto',
    repsPerSeries: 10,
    series: 4,
    restTime: '90s',
    videoUrl: '',
    description: 'Exercício para peitoral'
  };

  // Estado das séries
  const [seriesInputs, setSeriesInputs] = useState<Series[]>([
    { reps: 0, weight: 0 },
    { reps: 0, weight: 0 },
    { reps: 0, weight: 0 },
    { reps: 0, weight: 0 },
  ]);

  const [isCompleted, setIsCompleted] = useState(false);

  // Handler para atualizar os inputs das séries
  const handleSeriesInput = (index: number, field: 'reps' | 'weight', value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    
    setSeriesInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = {
        ...newInputs[index],
        [field]: numericValue
      };
      return newInputs;
    });
  };

  const toggleCompleted = () => {
    setIsCompleted(!isCompleted);
  };

  const showCurrentData = () => {
    Alert.alert(
      'Dados Atuais',
      JSON.stringify(seriesInputs, null, 2),
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demonstração SeriesInput</Text>
      <Text style={styles.subtitle}>com Histórico de Séries Anteriores</Text>
      
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{mockExercise.name}</Text>
        <Text style={styles.exerciseDetails}>
          {mockExercise.series} séries de {mockExercise.repsPerSeries} repetições
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.seriesContainer}
      >
        {Array.from({ length: mockExercise.series }, (_, index) => (
          <SeriesInput
            key={index}
            index={index}
            seriesInputs={seriesInputs}
            handleSeriesInput={handleSeriesInput}
            exercise={mockExercise}
            isCompleted={isCompleted}
            useMockData={true}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Text 
          style={styles.button} 
          onPress={toggleCompleted}
        >
          {isCompleted ? 'Reativar' : 'Completar'} Exercício
        </Text>
        
        <Text 
          style={styles.button} 
          onPress={showCurrentData}
        >
          Ver Dados Atuais
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Funcionalidades:</Text>
        <Text style={styles.infoText}>• Mostra dados da última execução como placeholder</Text>
        <Text style={styles.infoText}>• Exibe "Anterior: XxYkg" abaixo de cada série</Text>
        <Text style={styles.infoText}>• Botão ⚡ para preenchimento rápido</Text>
        <Text style={styles.infoText}>• Desabilita inputs quando exercício está completo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  exerciseInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  seriesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 120,
  },
  info: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default SeriesInputDemo;
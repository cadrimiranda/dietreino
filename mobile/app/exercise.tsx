import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ExerciseExecution from '@/components/exercise/ExerciseExecution';

export default function ExerciseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ExerciseExecution />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
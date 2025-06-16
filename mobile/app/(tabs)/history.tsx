import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import WorkoutHistory from '@/components/history/WorkoutHistory';

export default function History() {
  return (
    <SafeAreaView style={styles.container}>
      <WorkoutHistory />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
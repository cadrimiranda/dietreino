import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import WeeklyPlan from "@/components/plan/WeeklyPlan";

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <WeeklyPlan />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

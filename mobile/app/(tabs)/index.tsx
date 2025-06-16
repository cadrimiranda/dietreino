import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import TodayWorkout from "@/components/today/TodayWorkout";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TodayWorkout />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

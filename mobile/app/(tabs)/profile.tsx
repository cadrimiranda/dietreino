import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import UserProfile from "@/components/profile/UserProfile";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <UserProfile />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
});

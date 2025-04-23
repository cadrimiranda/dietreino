import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Icon, Text } from "@ui-kitten/components";
import { Exercise } from "@/types/exercise";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
};

const ExerciseHistory = ({
  exercise,
  showHistory,
  onClose,
}: {
  exercise: Exercise;
  showHistory: boolean;
  onClose: () => void;
}) => {
  const { history } = exercise;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "60%", "90%"], []);

  useEffect(() => {
    if (showHistory) {
      if (!bottomSheetRef.current) {
        return;
      }

      bottomSheetRef.current?.expand();
    }
  }, [showHistory]);

  const isEmpty = !history || history.length === 0;

  const emptyState = (
    <View style={styles.emptyState}>
      <Icon name="clipboard-outline" fill="#999" style={styles.emptyIcon} />
      <Text appearance="hint" category="s1">
        Nenhum histórico encontrado ainda 😅
      </Text>
    </View>
  );

  const renderHistory = history?.map((entry, index) => (
    <View key={index} style={styles.entry}>
      <Text style={styles.date}>📅 {formatDate(entry.date)}</Text>
      {entry.sets.map((set, idx) => (
        <Text key={idx} style={styles.set}>
          • {set.reps} reps @ {set.weight}kg
        </Text>
      ))}
    </View>
  ));

  const historyContent = isEmpty ? emptyState : renderHistory;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      index={-1}
    >
      <BottomSheetView style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => {
            bottomSheetRef.current?.close();
            onClose();
          }}
          style={styles.closeButton}
          hitSlop={10}
        >
          <Icon name="close-outline" fill="#333" style={styles.icon} />
        </TouchableOpacity>
        <ScrollView>
          <Text category="h6" style={styles.header}>
            Histórico
          </Text>
          {historyContent}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ExerciseHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "white",
  },
  header: {
    marginBottom: 16,
  },
  entry: {
    marginBottom: 20,
  },
  date: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  set: {
    marginLeft: 10,
    color: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "#f0f0f0",
    padding: 6,
    borderRadius: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Exercise, Series } from "../../types/exercise";
import ExerciseRestTimes from "./ExerciseRestTimes";
import SeriesInput from "./SeriesInput";
import ExerciseMenu from "./ExerciseMenu";
import ExerciseFinish from "./ExerciseFinish";
import ExerciseHistory from "./ExerciseHistory";

interface ExerciseCardProps {
  exercise: Exercise;
  onExerciseComplete: (exerciseId: string, isCompleted: boolean) => void;
  onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
}

export function ExerciseCard({
  exercise,
  onUpdateExercise,
  onExerciseComplete,
}: ExerciseCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [seriesInputs, setSeriesInputs] = useState<Series[]>(
    exercise.completedSeries || Array(exercise.series).fill({ reps: 0 })
  );
  const [notes, setNotes] = useState(exercise.userNotes || "");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleSeriesInput = (
    index: number,
    field: "reps" | "weight",
    value: string
  ) => {
    const newInputs = [...seriesInputs];
    newInputs[index] = {
      ...newInputs[index],
      [field]: Number(value) || 0,
    };
    setSeriesInputs(newInputs);
    onUpdateExercise(exercise.id, { completedSeries: newInputs });
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    onUpdateExercise(exercise.id, { userNotes: text });
  };

  const openYoutubeVideo = () => {
    if (exercise.youtubeUrl) {
      Linking.openURL(exercise.youtubeUrl);
    }
  };

  const handleCompleteExercise = () => {
    setIsCompleted(!isCompleted);
    onExerciseComplete(exercise.id, isCompleted);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.videoButton} onPress={openYoutubeVideo}>
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.name}</Text>

        <ExerciseMenu
          setMenuVisible={setMenuVisible}
          menuVisible={menuVisible}
          onShowHistory={handleShowHistory}
        />
      </View>

      <Text style={styles.trainerNotesTitle}>{exercise.trainerNotes}</Text>
      <View style={styles.divider} />

      <View style={styles.historyContainer}>
        <Text style={styles.seriesTitle}>
          {exercise.series} séries x {exercise.repsPerSeries} repetições
        </Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seriesScrollContent}
        >
          {Array.from({ length: exercise.series || 0 }).map((_, index) => (
            <SeriesInput
              key={index + (exercise.series || 0)}
              index={index}
              seriesInputs={seriesInputs}
              handleSeriesInput={handleSeriesInput}
              exercise={exercise}
              isCompleted={isCompleted}
            />
          ))}
        </ScrollView>
        <ExerciseRestTimes exercise={exercise} />

        <View style={styles.divider} />
        <Text style={styles.notesTitle}>Suas anotações:</Text>
        <TextInput
          style={styles.userNotesInput}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={handleNotesChange}
          placeholder="Adicione suas observações aqui..."
          editable={!isCompleted}
        />
      </View>

      <ExerciseFinish
        isCompleted={isCompleted}
        handleCompleteExercise={handleCompleteExercise}
      />

      <ExerciseHistory
        exercise={exercise}
        showHistory={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  historyButton: {
    marginLeft: 8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "justify",
    color: "#888888",
  },
  historyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#e0e0e0",
    borderRadius: 1,
    marginVertical: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    flexShrink: 1,
  },
  videoButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesTitle: {
    fontWeight: 'bold',
    color: '#A16207',
    marginBottom: 4,
    fontSize: 14,
  },
  notesText: {
    color: '#A16207',
    fontSize: 14,
    lineHeight: 18,
  },
  seriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  seriesScrollContent: {
    paddingRight: 16,
  },
  userNotesInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
  },
  trainerNotesTitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "justify",
    color: "#6B7280", // um cinza bonitão
    marginTop: 2,
    lineHeight: 18,
    marginBottom: 4,
  },
  // Novos estilos para o botão de menu e modal
  menuButton: {
    marginLeft: "auto",
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEFCE8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15',
  },
  userNotesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    marginBottom: 4,
  },
});

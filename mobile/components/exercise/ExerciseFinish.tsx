import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

type ExerciseFinishProps = {
  isCompleted: boolean;
  handleCompleteExercise: () => void;
};

const ExerciseFinish = ({
  isCompleted,
  handleCompleteExercise,
}: ExerciseFinishProps) => {
  return (
    <View style={{ flexDirection: "row", width: "100%", marginTop: 16 }}>
      <TouchableOpacity
        disabled={isCompleted}
        onPress={handleCompleteExercise}
        activeOpacity={0.8}
        style={[
          { flex: isCompleted ? 0.8 : 1, opacity: isCompleted ? 0.5 : 1 },
        ]}
      >
        <LinearGradient
          colors={["#7C3AED", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.completeButton]}
        >
          <Text style={styles.completeButtonText}>
            {isCompleted ? "Exercício concluído" : "Concluir"}
          </Text>
          {isCompleted && (
            <Ionicons
              name="checkmark"
              size={24}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>

      {isCompleted && (
        <TouchableOpacity
          style={[
            styles.undoButton,
            { flex: 0.2, opacity: isCompleted ? 1 : 0.5 },
          ]}
          disabled={!isCompleted}
          onPress={handleCompleteExercise}
        >
          <FontAwesome name="history" size={22} color="#7C3AED" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ExerciseFinish;

const styles = StyleSheet.create({
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#7C3AED",
    borderRadius: 12,
    padding: 12,
    marginLeft: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

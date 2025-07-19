import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useWorkoutHistorySummariesByUser,
  useWorkoutHistoriesByUserAndDate,
  useWorkoutHistoryById,
  WorkoutHistoryQueryData,
} from "@/hooks/useWorkoutHistoryQuery";
import WorkoutHistoryView from "./WorkoutHistoryView";

interface WorkoutData {
  date: string;
  workoutName: string;
  exercises: number;
  totalSets: number;
  duration: string;
  notes?: string;
}

interface ExerciseProgress {
  name: string;
  dates: string[];
  weights: number[];
}

const { width } = Dimensions.get("window");

export default function WorkoutHistory() {
  const { user } = useCurrentUser();
  const [selectedView, setSelectedView] = useState<
    "calendar" | "progress" | "search"
  >("calendar");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );

  // Fetch workout histories
  const {
    data: allSummariesData,
    loading: allHistoriesLoading,
    error: allHistoriesError,
  } = useWorkoutHistorySummariesByUser(user?.id);

  const { data: selectedHistoryData, loading: selectedHistoryLoading } =
    useWorkoutHistoryById(selectedHistoryId || undefined);

  const { data: dateHistoriesData, loading: dateHistoriesLoading } =
    useWorkoutHistoriesByUserAndDate(
      user?.id,
      selectedDate ? new Date(selectedDate) : undefined
    );

  const formatApiDate = (apiDateString: string) => {
    return new Date(apiDateString).toISOString().split("T")[0];
  };

  // const convertWorkoutHistoryData = (
  //   histories: WorkoutHistoryQueryData[]
  // ): WorkoutData[] => {
  //   return histories.map((history) => ({
  //     date: formatApiDate(history.executedAt), // Convert ISO string to local YYYY-MM-DD
  //     workoutName: history.workoutName,
  //     exercises: history.workoutHistoryExercises.length,
  //     totalSets: history.workoutHistoryExercises.reduce(
  //       (total, exercise) => total + exercise.completedSets,
  //       0
  //     ),
  //     duration: history.durationMinutes
  //       ? `${history.durationMinutes}min`
  //       : "N/A",
  //     notes: history.notes,
  //   }));
  // };

  // Get workout history data
  const allWorkoutSummaries =
    allSummariesData?.workoutHistorySummariesByUser || [];

  // This part needs to be refactored or removed as it's static data

  const getCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // Create calendar grid (6 weeks = 42 days)
    const calendar = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }

    return { calendar, firstDay, lastDay };
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(selectedMonth);
    if (direction === "prev") {
      newMonth.setMonth(selectedMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(selectedMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const formatDate = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    return formatted;
  };

  const hasWorkoutOnDate = (date: string) => {
    return allWorkoutSummaries.some((workout) => {
      const workoutDate = formatApiDate(workout.executedAt);
      return workoutDate === date;
    });
  };

  const renderMonthCalendar = () => {
    const { calendar } = getMonthCalendar(selectedMonth);
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    return (
      <View style={styles.monthCalendarContainer}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => changeMonth("prev")}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </Text>

          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => changeMonth("next")}
          >
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Days of week header */}
        <View style={styles.daysOfWeekHeader}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
            <Text key={index} style={styles.dayOfWeekLabel}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.monthGrid}>
          {calendar.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.monthWeekRow}>
              {week.map((date, dayIndex) => {
                const dateStr = formatDate(date);
                const hasWorkout = hasWorkoutOnDate(dateStr);
                const isToday = formatDate(new Date()) === dateStr;
                const isSelected = selectedDate === dateStr;
                const isCurrentMonth =
                  date.getMonth() === selectedMonth.getMonth();

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.monthDayContainer,
                      hasWorkout && styles.monthDayWithWorkout,
                      isToday && styles.monthDayToday,
                      isSelected && styles.monthDaySelected,
                      !isCurrentMonth && styles.monthDayOtherMonth,
                    ]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthDayNumber,
                        hasWorkout && styles.monthDayNumberWithWorkout,
                        isToday && styles.monthDayNumberToday,
                        isSelected && styles.monthDayNumberSelected,
                        !isCurrentMonth && styles.monthDayNumberOtherMonth,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {hasWorkout && isCurrentMonth && (
                      <View style={styles.monthWorkoutIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeCalendarButton}
          onPress={() => setShowMonthPicker(false)}
        >
          <Text style={styles.closeCalendarText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCalendarView = () => {
    const currentWeek = getCurrentWeek();

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Esta Semana</Text>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setShowMonthPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.calendarButtonText}>Calendário</Text>
          </TouchableOpacity>
        </View>

        {/* Week View */}
        <View style={styles.weekView}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => {
            const date = currentWeek[index];
            const dateStr = formatDate(date);
            const hasWorkout = hasWorkoutOnDate(dateStr);
            const isToday = formatDate(new Date()) === dateStr;
            const isSelected = selectedDate === dateStr;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  hasWorkout && styles.dayWithWorkout,
                  isToday && styles.dayToday,
                  isSelected && styles.daySelected,
                ]}
                onPress={() => {
                  setSelectedDate(dateStr);
                }}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayTodayText,
                    isSelected && styles.daySelectedText,
                  ]}
                >
                  {day}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayTodayText,
                    isSelected && styles.daySelectedText,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {hasWorkout && <View style={styles.workoutIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>
          {selectedDate
            ? `Treino de ${new Date(selectedDate).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
              })}`
            : "Treinos Recentes"}
        </Text>

        {/* Loading state */}
        {(allHistoriesLoading || dateHistoriesLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando histórico...</Text>
          </View>
        )}

        {/* Error state */}
        {allHistoriesError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>Erro ao carregar histórico</Text>
            <Text style={styles.errorSubtext}>
              Verifique sua conexão e tente novamente
            </Text>
          </View>
        )}

        {/* Workout list */}
        {!allHistoriesLoading &&
          !dateHistoriesLoading &&
          (() => {
            if (selectedDate) {
              const filteredData =
                dateHistoriesData?.workoutHistoriesByUserAndDate || [];

              // Additional frontend filtering to ensure exact date match
              const exactDateFilteredData = filteredData.filter((workout) => {
                const workoutDate = formatApiDate(workout.executedAt);
                return workoutDate === selectedDate;
              });

              // We now use the summary data directly
              return exactDateFilteredData;
            } else {
              return allWorkoutSummaries.slice(0, 5);
            }
          })().map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={styles.workoutItem}
              onPress={() => {
                setSelectedDate(formatApiDate(workout.executedAt));
                setShowHistoryDetail(true);
              }}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutDate}>
                  {new Date(workout.executedAt).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
                <Text style={styles.workoutDuration}>
                  {workout.durationMinutes
                    ? `${workout.durationMinutes}min`
                    : "N/A"}
                </Text>
              </View>
              <Text style={styles.workoutName}>{workout.workoutName}</Text>
              <Text style={styles.workoutStats}>
                Clique para ver detalhes
              </Text>
              {workout.notes && (
                <Text style={styles.workoutNotes} numberOfLines={2}>
                  {workout.notes}
                </Text>
              )}
            </TouchableOpacity>
          ))}

        {/* Empty state for selected date */}
        {selectedDate &&
          !dateHistoriesLoading &&
          (!dateHistoriesData?.workoutHistoriesByUserAndDate ||
            dateHistoriesData.workoutHistoriesByUserAndDate.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={48} color="#E5E5EA" />
              <Text style={styles.emptyStateText}>Nenhum treino realizado</Text>
              <Text style={styles.emptyStateSubtext}>
                Você não treinou neste dia
              </Text>
              <TouchableOpacity
                style={styles.clearSelectionButton}
                onPress={() => setSelectedDate(null)}
              >
                <Text style={styles.clearSelectionText}>
                  Ver todos os treinos
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };

  const renderSearchView = () => {
    const filteredWorkouts = allWorkoutSummaries.filter(
      (workout) =>
        workout.workoutName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar treinos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {searchQuery
            ? `Resultados (${filteredWorkouts.length})`
            : "Todos os Treinos"}
        </Text>

        {filteredWorkouts.map((workout, index) => (
          <TouchableOpacity key={index} style={styles.workoutItem}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutDate}>
                {new Date(workout.executedAt).toLocaleDateString("pt-BR")}
              </Text>
              <Text style={styles.workoutDuration}>
                {workout.durationMinutes
                  ? `${workout.durationMinutes}min`
                  : "N/A"}
              </Text>
            </View>
            <Text style={styles.workoutName}>{workout.workoutName}</Text>
            <Text style={styles.workoutStats}>
              {/* Details are fetched on click now */}
              Clique para ver detalhes
            </Text>
            {workout.notes && (
              <Text style={styles.workoutNotes}>{workout.notes}</Text>
            )}
          </TouchableOpacity>
        ))}

        {filteredWorkouts.length === 0 && searchQuery && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#E5E5EA" />
            <Text style={styles.emptyStateText}>Nenhum treino encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Tente buscar por outro termo
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedView === "calendar" && styles.tabActive,
            ]}
            onPress={() => setSelectedView("calendar")}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={selectedView === "calendar" ? "#FFFFFF" : "#8E8E93"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedView === "progress" && styles.tabActive,
            ]}
            onPress={() => setSelectedView("progress")}
          >
            <Ionicons
              name="trending-up"
              size={20}
              color={selectedView === "progress" ? "#FFFFFF" : "#8E8E93"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedView === "search" && styles.tabActive]}
            onPress={() => setSelectedView("search")}
          >
            <Ionicons
              name="search"
              size={20}
              color={selectedView === "search" ? "#FFFFFF" : "#8E8E93"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedView === "calendar" && renderCalendarView()}
        {selectedView === "search" && renderSearchView()}
      </ScrollView>

      {/* Month Calendar Modal */}
      <Modal
        visible={showMonthPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalContainer}>{renderMonthCalendar()}</View>
      </Modal>

      <Modal
        visible={showHistoryDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistoryDetail(false)}
      >
        <View style={styles.modalContainer}>
          {user && selectedDate && (
            <WorkoutHistoryView
              userId={user.id}
              date={new Date(selectedDate)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  calendarButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },

  // Calendar View
  calendarContainer: {
    paddingBottom: 20,
  },
  weekView: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  dayWithWorkout: {
    backgroundColor: "#E3F2FD",
  },
  dayToday: {
    backgroundColor: "#007AFF",
  },
  daySelected: {
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#30D158",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  dayTodayText: {
    color: "#FFFFFF",
  },
  daySelectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginTop: 4,
  },
  workoutItem: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    textTransform: "capitalize",
  },
  workoutDuration: {
    fontSize: 14,
    color: "#8E8E93",
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  workoutStats: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  workoutNotes: {
    fontSize: 14,
    color: "#1C1C1E",
    lineHeight: 20,
  },

  // Progress View
  progressContainer: {
    paddingBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    marginBottom: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  weightLabel: {
    fontSize: 10,
    color: "#8E8E93",
    marginBottom: 4,
  },
  chartBar: {
    width: "80%",
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    marginBottom: 4,
  },
  chartBarCurrent: {
    backgroundColor: "#007AFF",
  },
  dateLabel: {
    fontSize: 10,
    color: "#8E8E93",
  },
  progressSummary: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },

  // Search View
  searchContainer: {
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  clearSelectionButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  clearSelectionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Month Calendar Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  monthCalendarContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  daysOfWeekHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    marginBottom: 10,
  },
  dayOfWeekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  monthGrid: {
    flex: 1,
  },
  monthWeekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  monthDayContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 2,
    position: "relative",
  },
  monthDayWithWorkout: {
    backgroundColor: "#E3F2FD",
  },
  monthDayToday: {
    backgroundColor: "#007AFF",
  },
  monthDaySelected: {
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#30D158",
  },
  monthDayOtherMonth: {
    opacity: 0.3,
  },
  monthDayNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  monthDayNumberWithWorkout: {
    fontWeight: "600",
    color: "#007AFF",
  },
  monthDayNumberToday: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  monthDayNumberSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  monthDayNumberOtherMonth: {
    color: "#8E8E93",
  },
  monthWorkoutIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#007AFF",
    position: "absolute",
    bottom: 4,
  },
  closeCalendarButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  closeCalendarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

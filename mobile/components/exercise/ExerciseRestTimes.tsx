import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Exercise } from "../../types/exercise";
import { Ionicons } from "@expo/vector-icons";

const transformSecondsToMinutes = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	const padStart = (num: number) => num.toString().padStart(2, "0");

	return `${padStart(minutes)}:${padStart(remainingSeconds)}`;
};

const TimerDisplay = ({
	time,
	isSelected,
	handleSelectRestTime,
	countDown,
}: {
	time: number;
	isSelected: boolean;
	handleSelectRestTime: (time: number) => void;
	countDown: number;
}) => {
	const timeToDisplay = isSelected && countDown > 0 ? countDown : time;

	return (
		<TouchableOpacity onPress={() => handleSelectRestTime(time)}>
			<Text
				style={[
					styles.timerCountdown,
					isSelected && styles.timerCountdownSelected,
				]}
			>
				{transformSecondsToMinutes(timeToDisplay)}
			</Text>
		</TouchableOpacity>
	);
};

const ExerciseRestTimes = ({ exercise }: { exercise: Exercise }) => {
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [isTimerComplete, setIsTimerComplete] = useState(false);
	const [timerCount, setTimerCount] = useState(0);
	const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
		null,
	);
	const [selectedRestTime, setSelectedRestTime] = useState(
		exercise.restTime[0],
	);
	const [firstInterval, secondInterval] = exercise.restTime;
	const rightRestTime = secondInterval || firstInterval;

	const handleTimerPress = () => {
		if (!isTimerActive && !isTimerComplete) {
			setIsTimerActive(true);
			setTimerCount(selectedRestTime);
			const interval = setInterval(() => {
				setTimerCount((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						setIsTimerActive(false);
						setIsTimerComplete(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			setTimerInterval(interval);
		} else {
			setIsTimerActive(false);
			setIsTimerComplete(false);
			setTimerCount(0);
			timerInterval && clearInterval(timerInterval);
		}
	};

	const handleSelectRestTime = (time: number) => {
		setSelectedRestTime(time);
	};

	return (
		<View style={styles.restTimeContainer}>
			<View style={styles.timerRow}>
				{secondInterval && (
					<TimerDisplay
						time={firstInterval}
						isSelected={selectedRestTime === firstInterval}
						handleSelectRestTime={handleSelectRestTime}
						countDown={timerCount}
					/>
				)}
				<TouchableOpacity
					style={[
						styles.timerButton,
						{
							backgroundColor: isTimerActive ? "red" : "#3B82F6",
						},
					]}
					onPress={handleTimerPress}
				>
					<Ionicons
						name={isTimerActive ? "stop" : "timer-outline"}
						size={20}
						color="#fff"
					/>
				</TouchableOpacity>

				<TimerDisplay
					time={rightRestTime}
					isSelected={selectedRestTime === rightRestTime}
					handleSelectRestTime={handleSelectRestTime}
					countDown={timerCount}
				/>
			</View>
			<Text style={styles.restTimeTitleHelperText}>
				Selecione o tempo de descanso
			</Text>
		</View>
	);
};

export default ExerciseRestTimes;

const styles = StyleSheet.create({
	restTimeContainer: {
		marginTop: 16,
		alignItems: "center",
	},
	timerRow: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#3B82F6",
		borderRadius: 12,
	},
	timerCountdown: {
		fontSize: 15,
		fontWeight: "bold",
		marginRight: 16,
		marginLeft: 16,
		color: "#aaaaaa",
	},
	timerCountdownSelected: {
		color: "#1976D2",
	},
	timerButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		borderRadius: 12,
	},
	restTimeTitleHelperText: {
		fontSize: 14,
		color: "#666",
		marginTop: 8,
		textAlign: "center",
	},
});

import { Exercise, Series } from '@/types/exercise';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useExerciseHistory } from '@/hooks/useExerciseHistory';
import { useMockExerciseHistory } from '@/hooks/useMockExerciseHistory';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const SeriesInput = ({
    index,
    seriesInputs,
    handleSeriesInput,
    exercise,
    isCompleted,
    useMockData = false
}: {
    index: number;
    seriesInputs: Series[];
    handleSeriesInput: (index: number, field: 'reps' | 'weight', value: string) => void;
    exercise: Exercise;
    isCompleted: boolean;
    useMockData?: boolean;
}) => {
    const { user } = useCurrentUser();
    const { getExerciseHistory } = useExerciseHistory(user?.id || '');
    const { getMockExerciseHistory } = useMockExerciseHistory();

    // Usar dados mock ou dados reais baseado na prop
    const exerciseHistory = useMockData 
        ? getMockExerciseHistory(exercise.id, 1)
        : getExerciseHistory(exercise.id, 1);
    
    const lastSession = exerciseHistory[0];
    
    // Buscar a série correspondente da última sessão
    const lastSeriesData = lastSession?.sets?.find(set => set.setNumber === index + 1);

    const getPlaceholderValues = () => {
        if (lastSeriesData && lastSeriesData.isCompleted) {
            return {
                reps: lastSeriesData.reps.toString(),
                weight: lastSeriesData.weight?.toString() || '0',
            };
        }
        return {
            reps: exercise.repsPerSeries.toString(),
            weight: '0',
        };
    };

    const placeholders = getPlaceholderValues();

    const handleQuickFill = () => {
        if (lastSeriesData && lastSeriesData.isCompleted && !isCompleted) {
            handleSeriesInput(index, 'reps', lastSeriesData.reps.toString());
            if (lastSeriesData.weight) {
                handleSeriesInput(index, 'weight', lastSeriesData.weight.toString());
            }
        }
    };

    return (
        <View key={index} style={styles.seriesInput}>
            <View style={styles.seriesHeader}>
                <Text style={styles.seriesLabel}>Série {index + 1}</Text>
                {lastSeriesData && lastSeriesData.isCompleted && !isCompleted && (
                    <TouchableOpacity onPress={handleQuickFill} style={styles.quickFillButton}>
                        <Text style={styles.quickFillText}>⚡</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={seriesInputs[index]?.reps?.toString() || ''}
                        onChangeText={(value) => handleSeriesInput(index, 'reps', value)}
                        placeholder={placeholders.reps}
                        maxLength={2}
                        editable={!isCompleted}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Kg</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={seriesInputs[index]?.weight?.toString() || ''}
                        onChangeText={(value) => handleSeriesInput(index, 'weight', value)}
                        placeholder={placeholders.weight}
                        maxLength={5}
                        editable={!isCompleted}
                    />
                </View>
            </View>

            {/* Mostrar dados da última vez */}
            {lastSeriesData && lastSeriesData.isCompleted && (
                <View style={styles.previousData}>
                    <Text style={styles.previousDataText}>
                        Anterior: {lastSeriesData.reps}x{lastSeriesData.weight || 0}kg
                    </Text>
                </View>
            )}
        </View>
    )
};

export default SeriesInput;


const styles = StyleSheet.create({
    seriesContainer: {
        marginBottom: 16,
        marginTop: 16,
    },
    seriesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black',
        marginBottom: 8,
        textAlign: 'center',
    },
    seriesInput: {
        marginRight: 12,
        width: 120,
    },
    seriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    seriesLabel: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        flex: 1,
    },
    quickFillButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickFillText: {
        fontSize: 12,
        color: 'white',
    },
    inputGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    inputContainer: {
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 8,
        width: 55,
        textAlign: 'center',
        fontSize: 16,
        marginHorizontal: 2,
    },
    previousData: {
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    previousDataText: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
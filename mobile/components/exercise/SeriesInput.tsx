import { Exercise, Series } from '@/types/exercise';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const SeriesInput = ({
    index,
    seriesInputs,
    handleSeriesInput,
    exercise,
    isCompleted
}: {
    index: number;
    seriesInputs: Series[];
    handleSeriesInput: (index: number, field: 'reps' | 'weight', value: string) => void;
    exercise: Exercise;
    isCompleted: boolean;
}) => {
    return (
        <View key={index} style={styles.seriesInput}>
            <Text style={styles.seriesLabel}>Série {index + 1}</Text>
            <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={seriesInputs[index]?.reps?.toString() || ''}
                        onChangeText={(value) => handleSeriesInput(index, 'reps', value)}
                        placeholder={exercise.repsPerSeries.toString()}
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
                        placeholder="0"
                        maxLength={5}
                        editable={!isCompleted}
                    />
                </View>
            </View>
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
    seriesLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 4,
        textAlign: 'center',
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
});
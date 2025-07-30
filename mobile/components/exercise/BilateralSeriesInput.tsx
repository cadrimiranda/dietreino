import { Exercise, Series } from '@/types/exercise';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { useExerciseHistory } from '@/hooks/useExerciseHistory';
import { useMockExerciseHistory } from '@/hooks/useMockExerciseHistory';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface BilateralSeries extends Series {
  weightLeft?: number;
  repsLeft?: number;
  weightRight?: number;
  repsRight?: number;
  isBilateral?: boolean;
}

const BilateralSeriesInput = ({
    index,
    seriesInputs,
    handleSeriesInput,
    handleBilateralSeriesInput,
    exercise,
    isCompleted,
    useMockData = false
}: {
    index: number;
    seriesInputs: BilateralSeries[];
    handleSeriesInput: (index: number, field: 'reps' | 'weight', value: string) => void;
    handleBilateralSeriesInput: (index: number, field: 'repsLeft' | 'weightLeft' | 'repsRight' | 'weightRight' | 'isBilateral', value: string | boolean) => void;
    exercise: Exercise;
    isCompleted: boolean;
    useMockData?: boolean;
}) => {
    const { user } = useCurrentUser();
    const { getExerciseHistory } = useExerciseHistory(user?.id || '');
    const { getMockExerciseHistory } = useMockExerciseHistory();

    const currentSeries = seriesInputs[index] as BilateralSeries;
    // Verifica se o exercício é bilateral baseado na prescrição do treinador
    const isBilateral = exercise.isBilateral || false;

    const exerciseHistory = useMockData 
        ? getMockExerciseHistory(exercise.id, 1)
        : getExerciseHistory(exercise.id, 1);
    
    const lastSession = exerciseHistory[0];
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
            if (isBilateral) {
                // Para bilateral, preenche ambos os lados com os mesmos valores
                handleBilateralSeriesInput(index, 'repsLeft', lastSeriesData.reps.toString());
                handleBilateralSeriesInput(index, 'repsRight', lastSeriesData.reps.toString());
                if (lastSeriesData.weight) {
                    handleBilateralSeriesInput(index, 'weightLeft', lastSeriesData.weight.toString());
                    handleBilateralSeriesInput(index, 'weightRight', lastSeriesData.weight.toString());
                }
            } else {
                handleSeriesInput(index, 'reps', lastSeriesData.reps.toString());
                if (lastSeriesData.weight) {
                    handleSeriesInput(index, 'weight', lastSeriesData.weight.toString());
                }
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

            {/* Indicador de exercício unilateral (definido pelo treinador) */}
            {isBilateral && (
                <View style={styles.bilateralIndicator}>
                    <Text style={styles.bilateralLabel}>Exercício Unilateral</Text>
                </View>
            )}
            
            {isBilateral ? (
                // Input bilateral (lado esquerdo e direito)
                <View style={styles.bilateralContainer}>
                    <View style={styles.sideContainer}>
                        <Text style={styles.sideLabel}>Esquerdo</Text>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Reps</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={currentSeries?.repsLeft?.toString() || ''}
                                    onChangeText={(value) => handleBilateralSeriesInput(index, 'repsLeft', value)}
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
                                    value={currentSeries?.weightLeft?.toString() || ''}
                                    onChangeText={(value) => handleBilateralSeriesInput(index, 'weightLeft', value)}
                                    placeholder={placeholders.weight}
                                    maxLength={5}
                                    editable={!isCompleted}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.sideContainer}>
                        <Text style={styles.sideLabel}>Direito</Text>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Reps</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={currentSeries?.repsRight?.toString() || ''}
                                    onChangeText={(value) => handleBilateralSeriesInput(index, 'repsRight', value)}
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
                                    value={currentSeries?.weightRight?.toString() || ''}
                                    onChangeText={(value) => handleBilateralSeriesInput(index, 'weightRight', value)}
                                    placeholder={placeholders.weight}
                                    maxLength={5}
                                    editable={!isCompleted}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                // Input tradicional (bilateral)
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
            )}

            {/* Mostrar dados da última vez */}
            {lastSeriesData && lastSeriesData.isCompleted && (
                <View style={styles.previousData}>
                    <Text style={styles.previousDataText}>
                        Anterior: {lastSeriesData.reps}x{lastSeriesData.weight || 0}kg
                    </Text>
                </View>
            )}
        </View>
    );
};

export default BilateralSeriesInput;

const styles = StyleSheet.create({
    seriesInput: {
        marginRight: 12,
        width: 160, // Mais largo para acomodar inputs bilaterais
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
    bilateralIndicator: {
        backgroundColor: '#F0F8FF',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    bilateralLabel: {
        fontSize: 11,
        color: '#3B82F6',
        fontWeight: '600',
    },
    bilateralContainer: {
        marginTop: 4,
    },
    sideContainer: {
        marginBottom: 8,
    },
    sideLabel: {
        fontSize: 11,
        color: '#3B82F6',
        textAlign: 'center',
        marginBottom: 4,
        fontWeight: '600',
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
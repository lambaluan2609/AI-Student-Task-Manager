import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface TaskCheckboxProps {
  completed: boolean;
  onToggle: () => void;
}

const TaskCheckbox = ({ completed, onToggle }: TaskCheckboxProps) => {
  // Animation value for scaling effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Run animation when completion state changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [completed]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.6}
    >
      <Animated.View
        style={[
          styles.checkbox,
          completed && styles.checkboxCompleted,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {completed && (
          <Check size={16} color="#FFFFFF" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4, // Larger touch area
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  }
});

export default TaskCheckbox; 
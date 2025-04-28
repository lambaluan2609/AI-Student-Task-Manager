import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#FF3B30';
    case 'medium': return '#FF9500';
    case 'low': return '#34C759';
    default: return '#007AFF';
  }
};

// --- đưa lên trên ---
const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: { marginRight: 12 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' },
  completedTask: { textDecorationLine: 'line-through', color: '#999' },
  taskDetails: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  courseTag: {
    fontSize: 12, color: '#666', backgroundColor: '#f0f0f0',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: 'bold', color: 'white' },
  dueDate: { fontSize: 12, color: '#666' },
  deleteButton: { padding: 4 },
});
// ----------------------

export default function TaskList({ tasks, onToggleComplete, onDeleteTask, onEditTask }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Tasks</Text>
      {tasks.map(task => (
        <View key={task.id} style={styles.taskCard}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => onToggleComplete(task.id)}
          >
            <MaterialIcons 
              name={task.completed ? "check-box" : "check-box-outline-blank"}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.taskContent}
            onPress={() => onEditTask(task)}
          >
            <Text style={[
              styles.taskTitle,
              task.completed && styles.completedTask
            ]}>
              {task.title}
            </Text>
            <View style={styles.taskDetails}>
              <Text style={styles.courseTag}>{task.course}</Text>
              <View style={[
                styles.priorityTag,
                { backgroundColor: getPriorityColor(task.priority) }
              ]}>
                <Text style={styles.priorityText}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dueDate}>
                Due: {task.dueDate.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDeleteTask(task.id)}
          >
            <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

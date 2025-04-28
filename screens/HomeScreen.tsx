import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Animated, Modal } from 'react-native';
import { Plus, ChevronRight, Calendar, Clock, BookOpen, Check, X, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '../theme/colors';
import { taskApi } from '../services/mockApi';
import { Task } from '../types';
import AddTaskModal from '../components/AddTaskModal';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewAllVisible, setIsViewAllVisible] = useState(false);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await taskApi.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const addedTask = await taskApi.addTask(newTask);
      setTasks(prevTasks => [...prevTasks, addedTask]);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await taskApi.toggleTaskCompletion(taskId);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const progress = tasks.length > 0 
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100 
    : 0;

  const todayTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === today.toDateString();
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const renderTaskCard = (task: Task) => (
    <View key={task.id} style={[styles.taskCard, shadows.small]}>
      <LinearGradient
        colors={isDark ? gradients.card.dark : gradients.card.light}
        style={styles.taskCardContent}
      >
        <TouchableOpacity 
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
            { borderColor: isDark ? colors.primary : colors.primary }
          ]}
          onPress={() => handleToggleTask(task.id)}
        >
          {task.completed && <Check size={16} color={isDark ? colors.background.dark : colors.background.light} />}
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            { color: isDark ? colors.text.light : colors.text.primary },
            task.completed && styles.completedTask
          ]}>
            {task.title}
          </Text>
          <Text style={[styles.taskSubject, { color: isDark ? colors.text.light : colors.text.secondary }]}>
            {task.subject}
          </Text>
        </View>
        <View style={[
          styles.priorityContainer,
          { backgroundColor: getPriorityBackgroundColor(task.priority) }
        ]}>
          {task.priority === 'high' && <AlertTriangle size={16} color={colors.danger} />}
          <Text style={[
            styles.priorityText,
            { color: getPriorityTextColor(task.priority) }
          ]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={isDark ? gradients.background.dark : gradients.background.light}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
              Welcome back!
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? colors.text.light : colors.text.secondary }]}>
              Let's get things done
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <LinearGradient
            colors={isDark ? gradients.card.dark : gradients.card.light}
            style={[styles.progressCard, shadows.medium]}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                Today's Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: isDark ? colors.text.light : colors.text.primary }]}>
                {Math.round(progress)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Calendar size={20} color={isDark ? colors.text.light : colors.text.secondary} />
                <Text style={[styles.statValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  {tasks.length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  Tasks
                </Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={20} color={isDark ? colors.text.light : colors.text.secondary} />
                <Text style={[styles.statValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  {tasks.filter(t => t.completed).length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <BookOpen size={20} color={isDark ? colors.text.light : colors.text.secondary} />
                <Text style={[styles.statValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  {new Set(tasks.map(t => t.subject)).size}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  Subjects
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
              Today's Tasks
            </Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setIsViewAllVisible(true)}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                No tasks for today
              </Text>
            </View>
          ) : (
            todayTasks.map(renderTaskCard)
          )}
        </View>
      </Animated.ScrollView>

      <Modal
        visible={isViewAllVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsViewAllVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                All Tasks
              </Text>
              <TouchableOpacity onPress={() => setIsViewAllVisible(false)}>
                <X size={24} color={isDark ? colors.text.light : colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {tasks.map(renderTaskCard)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.addButton, shadows.large]}
        onPress={() => setIsAddModalVisible(true)}
      >
        <LinearGradient
          colors={gradients.primary}
          style={styles.addButtonGradient}
        >
          <Plus size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddTask}
      />
    </View>
  );
}

function getPriorityBackgroundColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'rgba(255, 59, 48, 0.1)';
    case 'medium':
      return 'rgba(255, 149, 0, 0.1)';
    case 'low':
      return 'rgba(52, 199, 89, 0.1)';
    default:
      return 'transparent';
  }
}

function getPriorityTextColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return colors.danger;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.success;
    default:
      return colors.text.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    padding: 20,
    marginTop: 200,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tasksSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskSubject: {
    fontSize: 14,
    opacity: 0.8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
});

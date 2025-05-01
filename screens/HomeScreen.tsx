import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Animated, Modal, Dimensions } from 'react-native';
import { Plus, ChevronRight, Calendar, Clock, BookOpen, Check, X, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '../theme/colors';
import { taskApi } from '../services/mockApi';
import { Task } from '../types';
import AddTaskModal from '../components/AddTaskModal';
import TaskCheckbox from '../components/TaskCheckbox';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewAllVisible, setIsViewAllVisible] = useState(false);
  const scrollY = new Animated.Value(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    // Find the task to toggle
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Get the current task state
    const taskToToggle = tasks[taskIndex];
    const newCompletedState = !taskToToggle.completed;
    
    // Update UI immediately
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: newCompletedState } : task
      )
    );
    
    // Then update the backend (with a slight delay to ensure UI state is visible)
    setTimeout(async () => {
      try {
        await taskApi.toggleTaskCompletion(taskId);
      } catch (error) {
        console.error('Error toggling task:', error);
        // Revert the UI change if the API call fails
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, completed: !newCompletedState } : task
          )
        );
      }
    }, 300);
  };

  const progress = tasks.length > 0 
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100 
    : 0;

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get weekly dates
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayTasks = getTasksForDate(selectedDate);

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

  // Memoize the renderTaskCard function to improve performance
  const renderTaskCard = useCallback((task: Task) => {
    const taskDate = new Date(task.deadline);
    const timeString = taskDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Extract the colors for better type safety
    const cardColors = isDark ? gradients.card.dark : gradients.card.light;
    
    return (
      <TouchableOpacity 
        key={task.id} 
        activeOpacity={0.8}
        style={[styles.taskCard, shadows.medium]}
        onPress={() => handleToggleTask(task.id)}
      >
        <LinearGradient
          colors={[cardColors[0], cardColors[1]]}
          style={styles.taskCardContent}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={[
            styles.taskCardInner,
            { 
              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.7)',
              borderLeftWidth: 4,
              borderLeftColor: task.completed ? colors.success : colors.primary
            }
          ]}>
            <View style={styles.taskCardHeader}>
              <View style={styles.checkboxContainer}>
                <TaskCheckbox 
                  completed={task.completed}
                  onToggle={() => handleToggleTask(task.id)}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text 
                  style={[
                    styles.taskTitle,
                    { color: isDark ? colors.text.light : colors.text.primary },
                    task.completed && styles.completedTask
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[
                    styles.subjectContainer,
                    { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(229, 231, 235, 0.6)' }
                  ]}>
                    <Text 
                      style={[styles.taskSubject, { color: isDark ? colors.text.light : colors.text.secondary }]}
                      numberOfLines={1}
                    >
                      {task.subject}
                    </Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Clock size={12} color={colors.accent} style={styles.timeIcon} />
                    <Text style={styles.taskDeadline}>
                      {timeString}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[
              styles.priorityContainer,
              { backgroundColor: getPriorityBackgroundColor(task.priority) }
            ]}>
              {task.priority === 'high' && <AlertTriangle size={14} color={colors.danger} />}
              <Text style={[
                styles.priorityText,
                { color: getPriorityTextColor(task.priority) }
              ]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [isDark, handleToggleTask]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={[
            (isDark ? gradients.background.dark : gradients.background.light)[0],
            (isDark ? gradients.background.dark : gradients.background.light)[1]
          ]}
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
            colors={[
              (isDark ? gradients.card.dark : gradients.card.light)[0],
              (isDark ? gradients.card.dark : gradients.card.light)[1]
            ]}
            style={[styles.progressCard, shadows.medium]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
                Today's Progress
              </Text>
              <View style={styles.progressBadge}>
                <Text style={[styles.progressPercentage, { color: '#fff' }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarBackground, 
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}
              />
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: getProgressColor(progress)
                  }
                ]} 
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={[
                styles.statItem, 
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)' }
              ]}>
                <Calendar size={20} color={isDark ? colors.text.light : colors.primary} />
                <Text style={[styles.statValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  {tasks.length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  Tasks
                </Text>
              </View>
              <View style={[
                styles.statItem,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)' }
              ]}>
                <Clock size={20} color={isDark ? colors.text.light : colors.primary} />
                <Text style={[styles.statValue, { color: isDark ? colors.text.light : colors.text.primary }]}>
                  {tasks.filter(t => t.completed).length}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                  Completed
                </Text>
              </View>
              <View style={[
                styles.statItem,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)' }
              ]}>
                <BookOpen size={20} color={isDark ? colors.text.light : colors.primary} />
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

        {/* Weekly Calendar */}
        <View style={styles.calendarSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Calendar size={20} color={isDark ? colors.text.light : colors.primary} style={{marginRight: 8}} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
              Weekly Schedule
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeklyCalendarContainer}
          >
            {weekDates.map((date) => {
              const dateTasksCount = getTasksForDate(date).length;
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dateContainer,
                    isToday(date) && styles.todayContainer,
                    isSelected && styles.selectedDateContainer,
                    shadows.medium
                  ]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? [gradients.primary[0], gradients.primary[1]]
                        : isToday(date)
                          ? [gradients.accent[0], gradients.accent[1]]
                          : [
                              (isDark ? gradients.card.dark : gradients.card.light)[0],
                              (isDark ? gradients.card.dark : gradients.card.light)[1]
                            ]
                    }
                    style={styles.dateGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                  >
                    <Text style={[
                      styles.dayName,
                      { color: isSelected || isToday(date) ? '#fff' : isDark ? colors.text.light : colors.text.primary }
                    ]}>
                      {getDayName(date)}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      { color: isSelected || isToday(date) ? '#fff' : isDark ? colors.text.light : colors.text.primary }
                    ]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[
                      styles.monthLabel,
                      { color: isSelected || isToday(date) ? 'rgba(255, 255, 255, 0.8)' : isDark ? colors.text.secondary : colors.text.secondary }
                    ]}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                    {dateTasksCount > 0 && (
                      <View style={[
                        styles.taskIndicator,
                        { backgroundColor: isSelected || isToday(date) ? '#fff' : colors.primary }
                      ]}>
                        <Text style={[
                          styles.taskCount,
                          { color: isSelected || isToday(date) ? colors.primary : '#fff' }
                        ]}>
                          {dateTasksCount}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Check size={20} color={isDark ? colors.text.light : colors.primary} style={{marginRight: 8}} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {isToday(selectedDate) ? "Today's Tasks" : `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </Text>
            <View style={{flex: 1}} />
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
                No tasks for {isToday(selectedDate) ? "today" : selectedDate.toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {todayTasks.map(task => renderTaskCard(task))}
            </View>
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
              {tasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: isDark ? colors.text.light : colors.text.secondary }]}>
                    No tasks available
                  </Text>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {tasks.map(task => renderTaskCard(task))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.addButton, shadows.large]}
        onPress={() => setIsAddModalVisible(true)}
      >
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
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

function getProgressColor(progress: number): string {
  if (progress < 30) return colors.danger;
  if (progress < 70) return colors.warning;
  return colors.success;
}

const { width } = Dimensions.get('window');
const dateItemWidth = (width - 40) / 5; // Show 5 dates with padding

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
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: '30%',
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
  calendarSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyCalendarContainer: {
    paddingVertical: 10,
  },
  dateContainer: {
    width: dateItemWidth,
    height: 100,
    marginRight: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dateGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  selectedDateContainer: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  monthLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  taskIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  tasksSection: {
    padding: 20,
    marginTop: 15,
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
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskCardContent: {
    padding: 3,
    borderRadius: 16,
  },
  taskCardInner: {
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 14,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    // Add this to ensure text doesn't overflow
    flexShrink: 1,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
    color: colors.success,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subjectContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  timeIcon: {
    marginRight: 4,
  },
  taskDeadline: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
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
  tasksList: {
    paddingTop: 8,
  },
});

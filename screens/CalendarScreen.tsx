import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, Animated } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '../theme/colors';
import { taskApi } from '../services/mockApi';
import { Task } from '../types';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    loadTasks();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await taskApi.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const getDaysInWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = Array.from({ length: lastDay.getDate() }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return day;
    });
    return days;
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          isSelected && styles.selectedContainer,
          { backgroundColor: isDark ? colors.background.dark : colors.background.light }
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayText,
          isToday && styles.todayText,
          { color: isDark ? colors.text.light : colors.text.primary }
        ]}>
          {date.getDate()}
        </Text>
        {dayTasks.length > 0 && (
          <View style={styles.tasksIndicator}>
            {dayTasks.some(t => t.priority === 'high') && (
              <AlertTriangle size={12} color={colors.danger} />
            )}
            <Text style={[
              styles.tasksCount,
              { color: isDark ? colors.text.light : colors.text.primary }
            ]}>
              {dayTasks.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedDateTasks = () => {
    if (!selectedDate) return null;
    const dayTasks = getTasksForDay(selectedDate);

    return (
      <Animated.View style={[styles.selectedTasksContainer, { opacity: fadeAnim }]}>
        <Text style={[
          styles.selectedDateTitle,
          { color: isDark ? colors.text.light : colors.text.primary }
        ]}>
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {dayTasks.length === 0 ? (
          <Text style={[
            styles.noTasksText,
            { color: isDark ? colors.text.light : colors.text.secondary }
          ]}>
            No tasks for this day
          </Text>
        ) : (
          <ScrollView style={styles.tasksList}>
            {dayTasks.map(task => (
              <View key={task.id} style={[
                styles.taskItem,
                { backgroundColor: isDark ? colors.background.dark : colors.background.light }
              ]}>
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityBackgroundColor(task.priority) }
                ]}>
                  {task.priority === 'high' && <AlertTriangle size={12} color={colors.danger} />}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskTitle,
                    { color: isDark ? colors.text.light : colors.text.primary }
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={[
                    styles.taskSubject,
                    { color: isDark ? colors.text.light : colors.text.secondary }
                  ]}>
                    {task.subject}
                  </Text>
                </View>
                <Clock size={16} color={isDark ? colors.text.light : colors.text.secondary} />
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
      <LinearGradient
        colors={isDark ? gradients.background.dark : gradients.background.light}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={handlePrev}>
              <ChevronLeft size={24} color={isDark ? colors.text.light : colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: isDark ? colors.text.light : colors.text.primary }]}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={handleNext}>
              <ChevronRight size={24} color={isDark ? colors.text.light : colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.viewMode}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'week' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('week')}
            >
              <Text style={[
                styles.viewModeText,
                viewMode === 'week' && styles.activeViewModeText,
                { color: isDark ? colors.text.light : colors.text.primary }
              ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'month' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('month')}
            >
              <Text style={[
                styles.viewModeText,
                viewMode === 'month' && styles.activeViewModeText,
                { color: isDark ? colors.text.light : colors.text.primary }
              ]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.calendarContainer}>
        <View style={styles.daysGrid}>
          {viewMode === 'week' ? getDaysInWeek(currentDate).map(renderDay) : getDaysInMonth(currentDate).map(renderDay)}
        </View>
      </ScrollView>

      {renderSelectedDateTasks()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewMode: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeViewModeButton: {
    backgroundColor: colors.primary,
  },
  viewModeText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  activeViewModeText: {
    color: '#fff',
  },
  calendarContainer: {
    flex: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 2,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedContainer: {
    backgroundColor: colors.primary + '20',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayText: {
    color: colors.primary,
  },
  tasksIndicator: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  selectedTasksContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...shadows.large,
  },
  selectedDateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noTasksText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    opacity: 0.8,
  },
}); 
import { Task } from '../types';

// Mock data store
let tasks: Task[] = [
  {
    id: '1',
    title: 'Complete Math Assignment',
    subject: 'Mathematics',
    deadline: new Date(), // Today's task
    priority: 'high',
    completed: false
  },
  {
    id: '2',
    title: 'Read History Chapter',
    subject: 'History',
    deadline: new Date(), // Today's task
    priority: 'medium',
    completed: false
  },
  {
    id: '3',
    title: 'Physics Lab Report',
    subject: 'Physics',
    deadline: new Date('2024-03-22'),
    priority: 'low',
    completed: true
  }
];

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    try {
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        completed: false
      };
      tasks.push(newTask);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  toggleTaskCompletion: async (taskId: string): Promise<Task> => {
    try {
      // Find the task
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      // Update the task's completed status
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        completed: !tasks[taskIndex].completed
      };
      
      // Return the updated task immediately without artificial delay
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates
      };
      
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      tasks = tasks.filter(t => t.id !== taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}; 
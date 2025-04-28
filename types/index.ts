export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
} 
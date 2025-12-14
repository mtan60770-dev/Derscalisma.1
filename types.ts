
export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  CREATE = 'CREATE',
  ADD_EXAM = 'ADD_EXAM',
  PROFILE = 'PROFILE',
  ANALYTICS = 'ANALYTICS',
  DAILY_BONUS = 'DAILY_BONUS',
  STUDENTS = 'STUDENTS',
  AI_TEST = 'AI_TEST',
  AI_VIDEO = 'AI_VIDEO',
  AI_SOLVER = 'AI_SOLVER',
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: 'class' | 'study' | 'break';
  completed: boolean;
  color?: string;
  dayIndex?: number;
  date?: string;
  reminder?: boolean;
}

export type ScoreType = 'written' | 'performance' | 'project';

export interface Exam {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: ScoreType; // New field
  targetScore: number;
  actualScore?: number;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  id: string; // Unique ID
  name: string;
  password?: string; // New Password Field
  schoolNumber?: string; // e-School style
  className?: string;    // e-School style
  grade?: number;        // 1-12 Grade Level
  avatarUrl: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  email?: string;
  averageScore?: number;
  coins: number;
  diamonds: number; 
  lastBonusClaimTime?: number; // Timestamp
  streak: number; // Current day streak (1...31)
  frameId?: string; // ID of the equipped frame
  ownedFrames: string[]; // List of IDs of owned frames
  friends?: string[]; // List of friend names (mock)
  goals: Goal[]; // Personal study goals
}

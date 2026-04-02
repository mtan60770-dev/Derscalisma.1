
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
  GROUPS = 'GROUPS',
  CONTEST = 'CONTEST',
  SECURITY = 'SECURITY',
  SPECIAL_EVENT_20 = 'SPECIAL_EVENT_20',
  SPECIAL_EVENT_40 = 'SPECIAL_EVENT_40',
  PAST_EXAMS = 'PAST_EXAMS',
  AI_COMPETITION = 'AI_COMPETITION',
  SPECIAL_EVENT_60 = 'SPECIAL_EVENT_60',
  FRIENDS = 'FRIENDS',
  FRIEND_PROFILE = 'FRIEND_PROFILE',
  POPULARITY_RANKING = 'POPULARITY_RANKING',
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  startTime: string; 
  endTime: string;   
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
  date: string; 
  time: string; 
  type: ScoreType; 
  targetScore: number;
  actualScore?: number;
}

export interface SolvedQuestions {
  total: number;
  test: number;
  classic: number;
  performance: number;
  bySubject: Record<string, number>;
}

export interface GiftRecord {
  senderId: string;
  senderName: string;
  giftIcon: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  password?: string;
  schoolNumber?: string;
  className?: string;
  grade: number;
  avatarUrl: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  email?: string;
  coins: number;
  diamonds: number; 
  lastBonusClaimTime?: number;
  streak: number;
  frameId?: string;
  ownedFrames: string[];
  ownedAvatars?: string[];
  goals: any[];
  badges?: Badge[];
  claimedBadges?: string[];
  completedMissionsToday?: string[];
  averageScore?: number;
  pinCode?: string;
  isSecurityEnabled?: boolean;
  isPrivacyModeEnabled?: boolean;
  dailyGoalTasks?: number;
  isDailyGoalActive?: boolean;
  specialEventStartDate?: number;
  specialEventProgress20?: number[]; // Array of completed day indices (0-19)
  specialEventProgress40?: number[]; // Array of completed day indices (0-39)
  specialEventProgress60?: number[]; // Array of completed day indices (0-59)
  specialEventStartDate40?: number;
  specialEventStartDate60?: number;
  lastSpecialEventCompletionTime20?: number;
  lastSpecialEventCompletionTime40?: number;
  lastSpecialEventCompletionTime60?: number;
  solvedQuestions?: SolvedQuestions;
  loginSessions?: LoginSession[];
  notifications?: Notification[];
  is2FAEnabled?: boolean;
  isBiometricEnabled?: boolean;
  autoLockTimer?: number;
  isSelfieVerificationActive?: boolean;
  isSavedLoginInfoActive?: boolean;
  isLoginLocationsActive?: boolean;
  isLoginAlertsActive?: boolean;
  isPersonalDetailsActive?: boolean;
  isInfoAndTracesActive?: boolean;
  isProActive?: boolean;
  isAiModerationEnabled?: boolean;
  isBanned?: boolean;
  banReason?: string;
  timeoutUntil?: number;
  violationCount?: number;
  timeoutReason?: string;
  targetRankId?: string;
  friends?: string[]; // Array of user IDs
  blockedFriends?: string[]; // Array of user IDs
  pinnedFriends?: string[]; // Array of user IDs
  friendRequests?: string[]; // Array of user IDs
  isFriendRequestsEnabled?: boolean;
  friendChats?: Record<string, GroupMessage[]>; // Map of friendId to messages
  popularity?: number;
  dailyPopularity?: number;
  weeklyPopularity?: number;
  lastDailyReset?: number;
  lastWeeklyReset?: number;
  receivedGifts?: GiftRecord[];
}

export interface LoginSession {
  id: string;
  deviceName: string;
  location: string;
  lastActive: number;
  isCurrent: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type: 'update' | 'feature' | 'security' | 'system';
}

export interface Mission {
    id: string;
    title: string;
    goal: string;
    reward: number;
    icon: string;
    gradeRequirement?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiredTasks?: number;
  requirementValue?: number;
  conditionType?: 'tasks' | 'coins' | 'streak' | 'diamonds' | 'security' | 'questions';
  description: string;
  rewardCoins?: number;
}

export interface Bot {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'system' | 'text' | 'gift' | 'bot';
  giftIcon?: string;
  isRead?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  ownerId: string;
  memberCount: number;
  messages: GroupMessage[];
  activeBots: string[];
  isPrivate: boolean;
  messageDelay: number;
  securityLevel: 'high' | 'low';
  isSubscriberOnly?: boolean;
  isExpiringMessages?: boolean;
  isVerificationRequired?: boolean;
  isMuted?: boolean;
  isDiscussionEnabled?: boolean;
  isAutoTranslate?: boolean;
  members?: string[];
}

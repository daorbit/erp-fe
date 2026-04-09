import type { IQueryParams } from './api';
import type {
  ReviewType,
  OverallRating,
  ReviewStatus,
  GoalCategory,
  GoalPriority,
  GoalStatus,
} from './enums';

// ─── Performance Review ─────────────────────────────────────────────────────

export interface IReviewGoal {
  _id?: string;
  title: string;
  description?: string;
  weightage: number;
  selfRating?: number;
  managerRating?: number;
  comments?: string;
}

export interface IReviewPeriod {
  startDate: string;
  endDate: string;
}

export interface IPerformanceReview {
  _id: string;
  employee: string;
  reviewer: string;
  reviewPeriod: IReviewPeriod;
  type: ReviewType;
  overallRating?: OverallRating;
  goals: IReviewGoal[];
  strengths: string[];
  areasOfImprovement: string[];
  employeeComments?: string;
  managerComments?: string;
  hrComments?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IPerformanceReviewListParams extends IQueryParams {
  employee?: string;
  reviewer?: string;
  type?: ReviewType;
  status?: ReviewStatus;
}

export type ICreatePerformanceReview = Omit<IPerformanceReview, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdatePerformanceReview = Partial<ICreatePerformanceReview>;

// ─── Goal ───────────────────────────────────────────────────────────────────

export interface IGoal {
  _id: string;
  employee: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  status: GoalStatus;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGoalListParams extends IQueryParams {
  employee?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
}

export type ICreateGoal = Omit<IGoal, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateGoal = Partial<ICreateGoal>;

// ─── User & Auth ────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

// ─── Employee ───────────────────────────────────────────────────────────────

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
  FREELANCER = 'freelancer',
}

export enum AccountType {
  SAVINGS = 'savings',
  CURRENT = 'current',
  SALARY = 'salary',
}

// ─── Attendance ─────────────────────────────────────────────────────────────

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  LATE = 'late',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
  WEEK_OFF = 'week_off',
  WORK_FROM_HOME = 'work_from_home',
}

// ─── Leave ──────────────────────────────────────────────────────────────────

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum HalfDayType {
  FIRST_HALF = 'first_half',
  SECOND_HALF = 'second_half',
}

export enum ApplicableFor {
  ALL = 'all',
  MALE = 'male',
  FEMALE = 'female',
}

// ─── Payroll ────────────────────────────────────────────────────────────────

export enum PayslipStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  APPROVED = 'approved',
  PAID = 'paid',
}

export enum PaymentMode {
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CASH = 'cash',
}

// ─── Recruitment ────────────────────────────────────────────────────────────

export enum JobPostingStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  FILLED = 'filled',
}

export enum JobEmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
  FREELANCER = 'freelancer',
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  OFFERED = 'offered',
  HIRED = 'hired',
  WITHDRAWN = 'withdrawn',
}

// ─── Performance ────────────────────────────────────────────────────────────

export enum PerformanceRating {
  OUTSTANDING = 'outstanding',
  EXCEEDS_EXPECTATIONS = 'exceeds_expectations',
  MEETS_EXPECTATIONS = 'meets_expectations',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  UNSATISFACTORY = 'unsatisfactory',
}

export enum OverallRating {
  OUTSTANDING = 'outstanding',
  EXCEEDS_EXPECTATIONS = 'exceeds_expectations',
  MEETS_EXPECTATIONS = 'meets_expectations',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  UNSATISFACTORY = 'unsatisfactory',
}

export enum ReviewType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  ANNUAL = 'annual',
  PROBATION = 'probation',
}

export enum ReviewStatus {
  DRAFT = 'draft',
  SELF_REVIEW = 'self_review',
  MANAGER_REVIEW = 'manager_review',
  HR_REVIEW = 'hr_review',
  COMPLETED = 'completed',
}

export enum GoalCategory {
  PERFORMANCE = 'performance',
  LEARNING = 'learning',
  PROJECT = 'project',
  BEHAVIORAL = 'behavioral',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DEFERRED = 'deferred',
  CANCELLED = 'cancelled',
}

// ─── Training ───────────────────────────────────────────────────────────────

export enum TrainingCategory {
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills',
  COMPLIANCE = 'compliance',
  LEADERSHIP = 'leadership',
  SAFETY = 'safety',
  OTHER = 'other',
}

export enum TrainerType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum TrainingMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
}

export enum TrainingStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ParticipantStatus {
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

// ─── Document ───────────────────────────────────────────────────────────────

export enum DocumentCategory {
  POLICY = 'policy',
  TEMPLATE = 'template',
  LETTER = 'letter',
  CERTIFICATE = 'certificate',
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
  EDUCATIONAL = 'educational',
  EXPERIENCE = 'experience',
  OTHER = 'other',
}

// ─── Holiday ────────────────────────────────────────────────────────────────

export enum HolidayType {
  PUBLIC = 'public',
  RELIGIOUS = 'religious',
  COMPANY_SPECIFIC = 'company_specific',
  OPTIONAL = 'optional',
}

export enum HolidayApplicableFor {
  ALL = 'all',
  SPECIFIC_DEPARTMENTS = 'specific_departments',
}

// ─── Announcement ───────────────────────────────────────────────────────────

export enum AnnouncementCategory {
  GENERAL = 'general',
  POLICY = 'policy',
  EVENT = 'event',
  ACHIEVEMENT = 'achievement',
  URGENT = 'urgent',
  MAINTENANCE = 'maintenance',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TargetAudience {
  ALL = 'all',
  DEPARTMENT = 'department',
  DESIGNATION = 'designation',
  SPECIFIC = 'specific',
}

// ─── Expense ────────────────────────────────────────────────────────────────

export enum ExpenseCategory {
  TRAVEL = 'travel',
  MEALS = 'meals',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  TRAINING = 'training',
  MEDICAL = 'medical',
  OTHER = 'other',
}

export enum ExpenseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REIMBURSED = 'reimbursed',
}

// ─── Asset ──────────────────────────────────────────────────────────────────

export enum AssetCategory {
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
  MONITOR = 'monitor',
  PHONE = 'phone',
  TABLET = 'tablet',
  FURNITURE = 'furniture',
  VEHICLE = 'vehicle',
  SOFTWARE = 'software',
  OTHER = 'other',
}

export enum AssetCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  DISPOSED = 'disposed',
}

export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  IN_REPAIR = 'in_repair',
  DISPOSED = 'disposed',
  LOST = 'lost',
}

// ─── Helpdesk / Ticket ─────────────────────────────────────────────────────

export enum TicketCategory {
  IT = 'it',
  HR = 'hr',
  FINANCE = 'finance',
  ADMIN = 'admin',
  FACILITIES = 'facilities',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

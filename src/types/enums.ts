// ─── User & Auth ────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
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

// ─── Master module enums (mirror backend shared/types.ts) ───────────────────

export enum EmployeeBand {
  TRAINEE = 'trainee',
  EXECUTIVE = 'executive',
  ASST_MANAGER = 'asst_manager',
  SR_MANAGER = 'sr_manager',
  LEADERSHIP = 'leadership',
}

export const EMPLOYEE_BAND_OPTIONS: { value: EmployeeBand; label: string }[] = [
  { value: EmployeeBand.ASST_MANAGER, label: 'Asst. Manager, Deputy Manager, Manager' },
  { value: EmployeeBand.EXECUTIVE,    label: 'Executive, Sr. Executive' },
  { value: EmployeeBand.LEADERSHIP,   label: 'Leadership Team' },
  { value: EmployeeBand.SR_MANAGER,   label: 'Sr. Manager, General Manager' },
  { value: EmployeeBand.TRAINEE,      label: 'Trainee, Jr. Executive' },
];

export enum HeadType {
  ADDITION = 'addition',
  DEDUCTION = 'deduction',
}

export const HEAD_TYPE_OPTIONS: { value: HeadType; label: string }[] = [
  { value: HeadType.ADDITION, label: 'Addition' },
  { value: HeadType.DEDUCTION, label: 'Deduction' },
];

export enum CalculationType {
  LUMPSUM = 'lumpsum',
  FORMULA = 'formula',
  FIXED_AMOUNT = 'fixed_amount',
  REMAINING_AMOUNT = 'remaining_amount',
}

export const CALCULATION_TYPE_OPTIONS: { value: CalculationType; label: string }[] = [
  { value: CalculationType.LUMPSUM,          label: 'Lumpsum' },
  { value: CalculationType.FORMULA,          label: 'Formula' },
  { value: CalculationType.FIXED_AMOUNT,     label: 'Fixed Amount' },
  { value: CalculationType.REMAINING_AMOUNT, label: 'Remaining Amount' },
];

export enum PayType {
  PAY_DAY_WISE = 'pay_day_wise',
  MONTH_WISE = 'month_wise',
  PRESENT_DAY_WISE = 'present_day_wise',
  PRESENT_LEAVE_DAY_WISE = 'present_leave_day_wise',
  PRESENT_LEAVE_HOLIDAY_DAY_WISE = 'present_leave_holiday_day_wise',
  PRESENT_LEAVE_WEEKOFF_DAY_WISE = 'present_leave_weekoff_day_wise',
}

export const PAY_TYPE_OPTIONS: { value: PayType; label: string }[] = [
  { value: PayType.PAY_DAY_WISE,                   label: 'Pay Day wise' },
  { value: PayType.MONTH_WISE,                     label: 'Month wise' },
  { value: PayType.PRESENT_DAY_WISE,               label: 'Present Day wise' },
  { value: PayType.PRESENT_LEAVE_DAY_WISE,         label: '(Present + Leave) Day wise' },
  { value: PayType.PRESENT_LEAVE_HOLIDAY_DAY_WISE, label: '(Present + Leave + Holiday) Day wise' },
  { value: PayType.PRESENT_LEAVE_WEEKOFF_DAY_WISE, label: '(Present + Leave + Week Off) Day wise' },
];

// Quick lookup from code → label (used by list views).
export const labelFromOptions = <T extends string>(
  options: { value: T; label: string }[],
  code?: T,
): string => options.find((o) => o.value === code)?.label ?? (code ?? '');

// ─── Phase 2 enums — Employee form, Resignation, User, etc. ────────────────

export enum EmpStatus { TEMPORARY = 'temporary', PERMANENT = 'permanent', CONTRACTUAL = 'contractual' }
export const EMP_STATUS_OPTIONS = [
  { value: EmpStatus.TEMPORARY, label: 'Temporary' },
  { value: EmpStatus.PERMANENT, label: 'Permanent' },
  { value: EmpStatus.CONTRACTUAL, label: 'Contractual' },
];

export enum LocalMigrant { LOCAL = 'local', MIGRANT = 'migrant', OTHER = 'other' }
export const LOCAL_MIGRANT_OPTIONS = [
  { value: LocalMigrant.LOCAL, label: 'Local' },
  { value: LocalMigrant.MIGRANT, label: 'Migrant' },
  { value: LocalMigrant.OTHER, label: 'Other' },
];

export enum CategorySkill {
  SKILLED = 'skilled', SEMI_SKILLED = 'semi_skilled', UNSKILLED = 'unskilled',
  UNSKILLED_SUPERVISORY = 'unskilled_supervisory', HIGHLY_SKILLED = 'highly_skilled',
}
export const CATEGORY_SKILL_OPTIONS = [
  { value: CategorySkill.SKILLED, label: 'Skilled' },
  { value: CategorySkill.SEMI_SKILLED, label: 'Semi-Skilled' },
  { value: CategorySkill.UNSKILLED, label: 'UnSkilled' },
  { value: CategorySkill.UNSKILLED_SUPERVISORY, label: 'Un-Skilled Supervisory' },
  { value: CategorySkill.HIGHLY_SKILLED, label: 'Highly Skilled' },
];

export enum SubCompany { SUB_CONTRACTOR = 'sub_contractor', SELF = 'self' }
export const SUB_COMPANY_OPTIONS = [
  { value: SubCompany.SUB_CONTRACTOR, label: 'Sub Contractor' },
  { value: SubCompany.SELF, label: 'Self' },
];

export enum PFScheme { EPFO = 'epfo', CMPF = 'cmpf' }
export const PF_SCHEME_OPTIONS = [
  { value: PFScheme.EPFO, label: 'EPFO' },
  { value: PFScheme.CMPF, label: 'CMPF' },
];

export enum TDSRegime { NEW = 'new', OLD = 'old' }
export const TDS_REGIME_OPTIONS = [
  { value: TDSRegime.NEW, label: 'New Regime' },
  { value: TDSRegime.OLD, label: 'Old Regime' },
];

export enum ReligionType {
  NA = 'na', HINDU = 'hindu', MUSLIM = 'muslim', CHRISTIAN = 'christian', SIKH = 'sikh',
  BUDDHIST = 'buddhist', JAIN = 'jain', OTHER = 'other', NOT_STATED = 'not_stated',
}
export const RELIGION_OPTIONS = [
  { value: ReligionType.NA, label: 'NA' },
  { value: ReligionType.HINDU, label: 'Hindu' },
  { value: ReligionType.MUSLIM, label: 'Muslim' },
  { value: ReligionType.CHRISTIAN, label: 'Christian' },
  { value: ReligionType.SIKH, label: 'Sikh' },
  { value: ReligionType.BUDDHIST, label: 'Buddhist' },
  { value: ReligionType.JAIN, label: 'Jain' },
  { value: ReligionType.OTHER, label: 'Other' },
  { value: ReligionType.NOT_STATED, label: 'Religion not stated' },
];

export enum Relation {
  MOTHER = 'mother', FATHER = 'father', BROTHER = 'brother', SISTER = 'sister',
  SPOUSE = 'spouse', SON = 'son', DAUGHTER = 'daughter',
}
export const RELATION_OPTIONS = [
  { value: Relation.MOTHER, label: 'Mother' },
  { value: Relation.FATHER, label: 'Father' },
  { value: Relation.BROTHER, label: 'Brother' },
  { value: Relation.SISTER, label: 'Sister' },
  { value: Relation.SPOUSE, label: 'Spouse' },
  { value: Relation.SON, label: 'Son' },
  { value: Relation.DAUGHTER, label: 'Daughter' },
];

export enum Division { FIRST = 'first', SECOND = 'second', THIRD = 'third' }
export const DIVISION_OPTIONS = [
  { value: Division.FIRST, label: 'First' },
  { value: Division.SECOND, label: 'Second' },
  { value: Division.THIRD, label: 'Third' },
];

export enum RoleType { FIXED_WORKING = 'fixed_working', ON_DEMAND_WORKING = 'on_demand_working', REPORTING = 'reporting' }
export const ROLE_TYPE_OPTIONS = [
  { value: RoleType.FIXED_WORKING, label: 'Fixed Working' },
  { value: RoleType.ON_DEMAND_WORKING, label: 'On Demand Working' },
  { value: RoleType.REPORTING, label: 'Reporting' },
];

export enum ResignMode {
  RESIGN = 'resign', TERMINATE = 'terminate', ABSCOND = 'abscond', BLACKLISTED = 'blacklisted',
  DEATH = 'death', OTHER = 'other', RETRENCHED = 'retrenched',
}
export const RESIGN_MODE_OPTIONS = [
  { value: ResignMode.RESIGN, label: 'RESIGN' },
  { value: ResignMode.TERMINATE, label: 'TERMINATE' },
  { value: ResignMode.ABSCOND, label: 'ABSCOND' },
  { value: ResignMode.BLACKLISTED, label: 'BLACKLISTED' },
  { value: ResignMode.DEATH, label: 'DEATH' },
  { value: ResignMode.OTHER, label: 'OTHER' },
  { value: ResignMode.RETRENCHED, label: 'RETRENCHED' },
];

export enum UserCategory { INTERNAL = 'internal', EXTERNAL = 'external' }
export enum UserType {
  SUPER_ADMIN = 'super_admin', ADMIN = 'admin', HO_USER = 'ho_user',
  SITE_ADMIN = 'site_admin', USER = 'user',
}
export const USER_TYPE_OPTIONS = [
  { value: UserType.SUPER_ADMIN, label: 'SUPERADMIN' },
  { value: UserType.ADMIN, label: 'ADMIN' },
  { value: UserType.HO_USER, label: 'HO-USER' },
  { value: UserType.SITE_ADMIN, label: 'SITE-ADMIN' },
  { value: UserType.USER, label: 'USER' },
];

export enum ErpModule {
  ADMIN = 'admin',
  ADMIN_ACCOUNTS = 'admin_accounts',
  CORRESPONDENCE = 'correspondence',
  HUMAN_RESOURCE = 'human_resource',
  MACHINERY = 'machinery',
  MIS_ADMIN = 'mis_admin',
  PRODUCTION = 'production',
  PROJECT_MANAGEMENT = 'project_management',
  PURCHASE = 'purchase',
  STORE = 'store',
  TENDER = 'tender',
}
export const ERP_MODULE_OPTIONS: { value: ErpModule; label: string; enabled: boolean }[] = [
  { value: ErpModule.ADMIN, label: 'ADMIN', enabled: true },
  { value: ErpModule.ADMIN_ACCOUNTS, label: 'ADMIN-ACCOUNTS', enabled: true },
  { value: ErpModule.CORRESPONDENCE, label: 'CORRESPONDENCE', enabled: false },
  { value: ErpModule.HUMAN_RESOURCE, label: 'HUMAN-RESOURCE', enabled: true },
  { value: ErpModule.MACHINERY, label: 'MACHINERY', enabled: false },
  { value: ErpModule.MIS_ADMIN, label: 'MIS-ADMIN', enabled: false },
  { value: ErpModule.PRODUCTION, label: 'PRODUCTION', enabled: false },
  { value: ErpModule.PROJECT_MANAGEMENT, label: 'PROJECT-MANAGEMENT', enabled: false },
  { value: ErpModule.PURCHASE, label: 'PURCHASE', enabled: false },
  { value: ErpModule.STORE, label: 'STORE', enabled: false },
  { value: ErpModule.TENDER, label: 'TENDER', enabled: false },
];

export const TITLE_OPTIONS = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
];

export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ value: g, label: g }));

export enum DeductionType {
  DEDUCTION_UNDER_CHAPTER_VI_A = 'deduction_under_chapter_vi_a',
  TAX_ON_EMPLOYMENT = 'tax_on_employment',
  STANDARD_DEDUCTION = 'standard_deduction',
  HRA = 'hra',
  OTHER = 'other',
}
export const DEDUCTION_TYPE_OPTIONS = [
  { value: DeductionType.DEDUCTION_UNDER_CHAPTER_VI_A, label: 'Deduction Under Chapter VI A' },
  { value: DeductionType.TAX_ON_EMPLOYMENT, label: 'Tax On Employment' },
  { value: DeductionType.STANDARD_DEDUCTION, label: 'Standard Deduction' },
  { value: DeductionType.HRA, label: 'HRA' },
  { value: DeductionType.OTHER, label: 'Other' },
];

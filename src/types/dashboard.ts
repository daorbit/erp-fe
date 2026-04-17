export interface IDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  presentToday: number;
  onLeaveToday: number;
  openTickets: number;
}

export interface IAttendanceOverview {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  workFromHome: number;
}

export interface IDepartmentDistribution {
  department: string;
  count: number;
}

export interface IRecentActivity {
  _id: string;
  type: string;
  message: string;
  user: string;
  createdAt: string;
}

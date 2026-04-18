import React from 'react';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';

// Employee Branch Shift — same filter panel as Employee List.
// The "Add" action opens the employee edit page where branch/shift is set.
const BranchShiftPage: React.FC = () => (
  <EmployeeFilterPanel
    title="Employee Branch Shift"
    fields={[
      'employeeName', 'company', 'department', 'level', 'tagName', 'employeeCode', 'workId',
      'designation', 'grade', 'employeeGroup', 'aadhaar', 'dojDate',
      'status', 'remark', 'documentUpload', 'vaccineStatus',
    ]}
    actionLabel="Search"
  />
);

export default BranchShiftPage;

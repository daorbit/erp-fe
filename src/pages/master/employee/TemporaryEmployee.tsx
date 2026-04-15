import React from 'react';
import EmployeeAdd from './Add';

// Temporary Employee — same Employee form, prefilled with empStatus=temporary.
// The user can flip the status later to convert them to a permanent record.
const TemporaryEmployee: React.FC = () => {
  // We reuse the full Employee form component. The `empStatus` is set via the
  // initial values of the Add form (temporary). Users can flip it later.
  return <EmployeeAdd />;
};

export default TemporaryEmployee;

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Typography, Button, Tabs, Table, Spin, Tag } from 'antd';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useEmployee } from '@/hooks/queries/useEmployees';
import dayjs from 'dayjs';

const { Title } = Typography;

const fmtDate = (v: any) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const txt = (v: any) => v || '—';
const refName = (v: any) => (typeof v === 'object' && v ? v.name || v.title || '—' : '—');

const EmployeeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useEmployee(id!);
  const e: any = data?.data ?? data ?? {};

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  const fullName = `${e.title ?? ''} ${e.userId?.firstName ?? e.firstName ?? ''} ${e.userId?.lastName ?? e.lastName ?? ''}`.trim();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/master/employee/list')} />
          <Title level={4} className="!mb-0">{fullName || 'Employee Details'}</Title>
          {e.isActive !== undefined && (
            <Tag color={e.isActive ? 'green' : 'red'}>{e.isActive ? 'Active' : 'Inactive'}</Tag>
          )}
        </div>
        <Button type="primary" icon={<Edit2 size={14} />} onClick={() => navigate(`/master/employee/edit/${id}`)}>Edit</Button>
      </div>

      {/* ─── TOP PANEL: Key Employment Info ─────────────────────────── */}
      <Card bordered={false}>
        <Descriptions column={{ xs: 1, sm: 2, xl: 3 }} bordered size="small">
          <Descriptions.Item label="Employee Code">{txt(e.employeeId)}</Descriptions.Item>
          <Descriptions.Item label="Employee Name">{fullName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Joining Date">{fmtDate(e.joinDate)}</Descriptions.Item>
          <Descriptions.Item label="File No.">{txt(e.fileNo)}</Descriptions.Item>
          <Descriptions.Item label="Company">{refName(e.company)}</Descriptions.Item>
          <Descriptions.Item label="Branch">{refName(e.branch)}</Descriptions.Item>
          <Descriptions.Item label="Department">{refName(e.department)}</Descriptions.Item>
          <Descriptions.Item label="Designation">{refName(e.designation)}</Descriptions.Item>
          <Descriptions.Item label="Level">{refName(e.level)}</Descriptions.Item>
          <Descriptions.Item label="Grade">{refName(e.grade)}</Descriptions.Item>
          <Descriptions.Item label="Employee Group">{refName(e.employeeGroup)}</Descriptions.Item>
          <Descriptions.Item label="Shift">{typeof e.shift === 'object' && e.shift ? e.shift.name : txt(e.workShift)}</Descriptions.Item>
          <Descriptions.Item label="Special Employee">{e.specialEmployee ? 'Yes' : 'No'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ─── TABS ────────────────────────────────────────────────────── */}
      <Card bordered={false}>
        <Tabs items={[
          {
            key: 'personal',
            label: 'Personal Detail',
            children: (
              <Descriptions column={{ xs: 1, sm: 2, xl: 3 }} bordered size="small">
                <Descriptions.Item label="Father/Husband Name">{txt(e.fatherName)}</Descriptions.Item>
                <Descriptions.Item label="Mother Name">{txt(e.motherName)}</Descriptions.Item>
                <Descriptions.Item label="Spouse Name">{txt(e.spouseName)}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{fmtDate(e.dateOfBirth)}</Descriptions.Item>
                <Descriptions.Item label="Gender">{txt(e.gender)}</Descriptions.Item>
                <Descriptions.Item label="Marital Status">{txt(e.maritalStatus)}</Descriptions.Item>
                <Descriptions.Item label="Anniversary">{fmtDate(e.anniversary)}</Descriptions.Item>
                <Descriptions.Item label="Blood Group">{txt(e.bloodGroup)}</Descriptions.Item>
                <Descriptions.Item label="Mobile No.">{txt(e.mobileNo || e.userId?.phone)}</Descriptions.Item>
                <Descriptions.Item label="Alternate Mobile">{txt(e.alternateMobileNo)}</Descriptions.Item>
                <Descriptions.Item label="Email">{txt(e.userId?.email || e.email)}</Descriptions.Item>
                <Descriptions.Item label="Alternate Email">{txt(e.alternateEmail)}</Descriptions.Item>
                <Descriptions.Item label="Present Address" span={3}>{txt(e.currentAddress?.street)}</Descriptions.Item>
                <Descriptions.Item label="Permanent Address" span={3}>{txt(e.permanentAddress?.street)}</Descriptions.Item>
                <Descriptions.Item label="City">{refName(e.city)}</Descriptions.Item>
                <Descriptions.Item label="City (Permanent)">{refName(e.permanentCity)}</Descriptions.Item>
                <Descriptions.Item label="Height">{e.heightFeet || e.heightInches ? `${e.heightFeet || 0}' ${e.heightInches || 0}"` : '—'}</Descriptions.Item>
                <Descriptions.Item label="Weight">{e.weightKg ? `${e.weightKg} kg` : '—'}</Descriptions.Item>
                <Descriptions.Item label="Religion">{txt(e.religionEnum)}</Descriptions.Item>
                <Descriptions.Item label="Nationality">{txt(e.nationality)}</Descriptions.Item>
                <Descriptions.Item label="Local/Migrant">{txt(e.localMigrant)}</Descriptions.Item>
                <Descriptions.Item label="Category Skill">{txt(e.categorySkill)}</Descriptions.Item>
                <Descriptions.Item label="Sub Company">{txt(e.subCompany)}</Descriptions.Item>
                <Descriptions.Item label="PF Scheme">{txt(e.pfScheme)}</Descriptions.Item>
                <Descriptions.Item label="Emp Status">{txt(e.empStatus)}</Descriptions.Item>
                <Descriptions.Item label="1st Vaccination">{fmtDate(e.firstVaccinationDate)}</Descriptions.Item>
                <Descriptions.Item label="2nd Vaccination">{fmtDate(e.secondVaccinationDate)}</Descriptions.Item>
                <Descriptions.Item label="Physically Challenged">{e.isPhysicallyChallenged ? 'Yes' : 'No'}</Descriptions.Item>
                <Descriptions.Item label="International Employee">{e.isInternationalEmployee ? 'Yes' : 'No'}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'hr',
            label: 'HR Detail',
            children: (
              <Descriptions column={{ xs: 1, sm: 2, xl: 3 }} bordered size="small">
                <Descriptions.Item label="Joining Date (Company Grp)">{fmtDate(e.joiningDateCompanyGrp)}</Descriptions.Item>
                <Descriptions.Item label="Interview Date">{fmtDate(e.interviewDate)}</Descriptions.Item>
                <Descriptions.Item label="Confirmation Day">{txt(e.confirmationDay)}</Descriptions.Item>
                <Descriptions.Item label="Tag Name">{refName(e.tagName)}</Descriptions.Item>
                <Descriptions.Item label="Valid Till">{fmtDate(e.validTill)}</Descriptions.Item>
                <Descriptions.Item label="Driving License No.">{txt(e.drivingLicenseNo)}</Descriptions.Item>
                <Descriptions.Item label="License Category">{txt(e.licenseCategory)}</Descriptions.Item>
                <Descriptions.Item label="Passport No.">{txt(e.passportNo)}</Descriptions.Item>
                <Descriptions.Item label="Issue Country">{txt(e.issueCountry)}</Descriptions.Item>
                <Descriptions.Item label="Passport Issue Date">{fmtDate(e.passportIssueDate)}</Descriptions.Item>
                <Descriptions.Item label="Passport Expiry">{fmtDate(e.passportExpiryDate)}</Descriptions.Item>
                <Descriptions.Item label="Visa Type">{txt(e.visaType)}</Descriptions.Item>
                <Descriptions.Item label="Visa Expiry">{fmtDate(e.visaExpiryDate)}</Descriptions.Item>
                <Descriptions.Item label="Voter ID">{txt(e.voterId)}</Descriptions.Item>
                <Descriptions.Item label="Previous Experience">{e.previousExperienceYear || e.previousExperienceMonth ? `${e.previousExperienceYear || 0} yr ${e.previousExperienceMonth || 0} mo` : '—'}</Descriptions.Item>
                <Descriptions.Item label="Aadhaar Card Name">{txt(e.aadhaarCardName)}</Descriptions.Item>
                <Descriptions.Item label="Aadhaar No.">{txt(e.identityDocs?.aadhaarNumber)}</Descriptions.Item>
                <Descriptions.Item label="Virtual ID">{txt(e.virtualId)}</Descriptions.Item>
                <Descriptions.Item label="PAN No.">{txt(e.identityDocs?.panNumber)}</Descriptions.Item>
                <Descriptions.Item label="PAN Card Name">{txt(e.panCardName)}</Descriptions.Item>
                <Descriptions.Item label="PF Number">{txt(e.pfNumber)}</Descriptions.Item>
                <Descriptions.Item label="PF Date">{fmtDate(e.pfDate)}</Descriptions.Item>
                <Descriptions.Item label="PF Exit Date">{fmtDate(e.pfExitDate)}</Descriptions.Item>
                <Descriptions.Item label="Universal Acc No.">{txt(e.universalAccNo)}</Descriptions.Item>
                <Descriptions.Item label="ESIC No.">{txt(e.esicNo)}</Descriptions.Item>
                <Descriptions.Item label="ESIC Date">{fmtDate(e.esicDate)}</Descriptions.Item>
                <Descriptions.Item label="PAN Aadhaar Linking">{e.panAadhaarLinkingDec ? 'Yes' : 'No'}</Descriptions.Item>
                <Descriptions.Item label="Emp Remark">{txt(e.empRemark)}</Descriptions.Item>
                <Descriptions.Item label="Total Working/Day">{e.totalWorkingPerDay ? `${e.totalWorkingPerDay} hr` : '—'}</Descriptions.Item>
                <Descriptions.Item label="Notice Period">{e.noticePeriodDays ? `${e.noticePeriodDays} days` : '—'}</Descriptions.Item>
                <Descriptions.Item label="TDS Regime">{txt(e.tdsRegimeType)}</Descriptions.Item>
                <Descriptions.Item label="LWF">{txt(e.lwf)}</Descriptions.Item>
                <Descriptions.Item label="Service Book No.">{txt(e.serviceBookNo)}</Descriptions.Item>
                <Descriptions.Item label="Fuel Rate">{e.fuelRate || '—'}</Descriptions.Item>
                <Descriptions.Item label="Bond Expiry">{fmtDate(e.bondExpiryDate)}</Descriptions.Item>
                <Descriptions.Item label="Education Level">{txt(e.educationLevel)}</Descriptions.Item>
                <Descriptions.Item label="Referred By">{txt(e.referredBy)}</Descriptions.Item>
                <Descriptions.Item label="Referred Contact">{txt(e.referredContactNo)}</Descriptions.Item>
                <Descriptions.Item label="Appointment Issue Date">{fmtDate(e.appointmentIssueDate)}</Descriptions.Item>
                <Descriptions.Item label="Receive Date">{fmtDate(e.receiveDate)}</Descriptions.Item>
                <Descriptions.Item label="PRAN (NPS)">{txt(e.pranNps)}</Descriptions.Item>
                <Descriptions.Item label="Citizen No.">{txt(e.citizenNo)}</Descriptions.Item>
                <Descriptions.Item label="Currency">{txt(e.currency)}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'bank',
            label: 'Bank Details',
            children: (
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Employee Bank Name">{txt(e.employeeBankName)}</Descriptions.Item>
                <Descriptions.Item label="Bank Acc No.">{txt(e.employeeBankAccNo)}</Descriptions.Item>
                <Descriptions.Item label="IFSC Code">{txt(e.ifscCode)}</Descriptions.Item>
                <Descriptions.Item label="Account Holder Name">{txt(e.bankAccountHolderName)}</Descriptions.Item>
                <Descriptions.Item label="Bank Branch">{txt(e.employeeBankBranch)}</Descriptions.Item>
                <Descriptions.Item label="Employer Bank">{refName(e.employerBankName)}</Descriptions.Item>
                <Descriptions.Item label="Custom Employee Code">{txt(e.customEmployeeCode)}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'relatives',
            label: 'Relative Detail',
            children: (
              <Table
                size="small" bordered pagination={false}
                dataSource={e.relatives ?? []} rowKey={(_: any, i: number) => i}
                columns={[
                  { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                  { title: 'Relation', dataIndex: 'relation' },
                  { title: 'Name', dataIndex: 'relativeName' },
                  { title: 'Nominee', render: (_: any, r: any) => r.isNominee ? 'Yes' : 'No' },
                  { title: 'Contact', dataIndex: 'contactNo' },
                  { title: 'Emergency', render: (_: any, r: any) => r.isEmergency ? 'Yes' : 'No' },
                  { title: 'Aadhaar', dataIndex: 'aadhaarNo' },
                  { title: 'DOB', render: (_: any, r: any) => fmtDate(r.dob) },
                  { title: 'Blood Group', dataIndex: 'bloodGroup' },
                ]}
              />
            ),
          },
          {
            key: 'education',
            label: 'Education Detail',
            children: (
              <Table
                size="small" bordered pagination={false}
                dataSource={e.education ?? []} rowKey={(_: any, i: number) => i}
                columns={[
                  { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                  { title: 'Degree', dataIndex: 'degreeOfExam' },
                  { title: 'University/College', dataIndex: 'universityCollegeSchool' },
                  { title: 'Division', dataIndex: 'division' },
                  { title: '% Marks', dataIndex: 'percentageOfMarks' },
                  { title: 'Passing Year', dataIndex: 'passingYear' },
                  { title: 'Principal Subject', dataIndex: 'principalSubject' },
                  { title: 'Remark', dataIndex: 'remark' },
                ]}
              />
            ),
          },
          {
            key: 'empRoles',
            label: 'Emp Roles',
            children: (
              <Table
                size="small" bordered pagination={false}
                dataSource={e.empRoles ?? []} rowKey={(_: any, i: number) => i}
                columns={[
                  { title: 'Role Type', dataIndex: 'roleType' },
                  { title: 'Description', dataIndex: 'description' },
                ]}
              />
            ),
          },
          {
            key: 'prevOrgs',
            label: 'Previous Organization',
            children: (
              <Table
                size="small" bordered pagination={false}
                dataSource={e.previousOrgs ?? []} rowKey={(_: any, i: number) => i}
                columns={[
                  { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'From', render: (_: any, r: any) => fmtDate(r.from) },
                  { title: 'To', render: (_: any, r: any) => fmtDate(r.to) },
                  { title: 'Designation', dataIndex: 'designation' },
                  { title: 'Last Salary', dataIndex: 'lastSalaryDrawn' },
                  { title: 'Reason', dataIndex: 'reasonForLeaving' },
                ]}
              />
            ),
          },
          {
            key: 'docs',
            label: 'Documents & Photo',
            children: (
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Photo">{e.photoUrl ? <a href={e.photoUrl} target="_blank" rel="noreferrer">View Photo</a> : '—'}</Descriptions.Item>
                <Descriptions.Item label="Signature">{e.signatureUrl ? <a href={e.signatureUrl} target="_blank" rel="noreferrer">View Signature</a> : '—'}</Descriptions.Item>
              </Descriptions>
            ),
          },
        ]} />
      </Card>
    </div>
  );
};

export default EmployeeView;

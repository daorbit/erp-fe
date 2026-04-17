import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Select, Button, Space, Typography, App, Descriptions, Statistic, Row, Col,
} from 'antd';
import { List as ListIcon } from 'lucide-react';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import employeeService from '@/services/employeeService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const FullAndFinal: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [company, setCompany] = useState<string | undefined>();
  const [branch, setBranch] = useState<string | undefined>();
  const [department, setDepartment] = useState<string | undefined>();
  const [designation, setDesignation] = useState<string | undefined>();
  const [employee, setEmployee] = useState<string | undefined>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: myCompanyData } = useMyCompany();
  const companyOptions = myCompanyData?.data
    ? [{ value: myCompanyData.data._id || myCompanyData.data.id, label: myCompanyData.data.name }]
    : [];

  // Auto-select the user's company
  useEffect(() => {
    if (myCompanyData?.data && !company) {
      setCompany(myCompanyData.data._id || myCompanyData.data.id);
    }
  }, [myCompanyData, company]);

  const { data: branches } = useBranchList();
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: emps } = useEmployeeList();

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));
  const empOpts = (emps?.data ?? [])
    .filter((e: any) => {
      if (company && (typeof e.company === 'object' ? e.company?._id : e.company) !== company) return false;
      if (branch && (typeof e.branch === 'object' ? e.branch?._id : e.branch) !== branch) return false;
      if (department && (typeof e.department === 'object' ? e.department?._id : e.department) !== department) return false;
      if (designation && (typeof e.designation === 'object' ? e.designation?._id : e.designation) !== designation) return false;
      return true;
    })
    .map((e: any) => ({
      value: e._id || e.id,
      label: `${e.firstName ?? ''} ${e.lastName ?? ''} - (${e.employeeId ?? ''})`,
    }));

  const handleShow = async () => {
    if (!employee) { message.error('Pick an employee'); return; }
    setLoading(true);
    try {
      const res: any = await employeeService.fullAndFinal(employee);
      setResult(res?.data);
    } catch (err: any) {
      message.error(err?.message || 'Failed to compute F&F');
    } finally { setLoading(false); }
  };

  const fmtINR = (n: number | undefined) =>
    (n ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Full And Final Statement</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/employee/list')}>List</Button>
      </div>

      <Card bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <div className="text-xs mb-1">Company Name</div>
            <Select placeholder="ALL" allowClear value={company} onChange={setCompany}
              options={companyOptions} className="w-full" />
          </div>
          <div>
            <div className="text-xs mb-1">Branch Name</div>
            <Select placeholder="ALL" allowClear value={branch} onChange={setBranch}
              options={opts(branches?.data ?? [])} className="w-full" />
          </div>
          <div>
            <div className="text-xs mb-1">Department Name</div>
            <Select placeholder="ALL" allowClear value={department} onChange={setDepartment}
              options={opts(depts?.data ?? [])} className="w-full" />
          </div>
          <div>
            <div className="text-xs mb-1">Designation Name</div>
            <Select placeholder="ALL" allowClear value={designation} onChange={setDesignation}
              options={opts(desigs?.data ?? [])} className="w-full" />
          </div>
          <div className="col-span-full">
            <div className="text-xs mb-1">Employee Name *</div>
            <Select placeholder="Please Select" showSearch optionFilterProp="label"
              value={employee} onChange={setEmployee} options={empOpts} className="w-full" />
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Space>
            <Button type="primary" onClick={handleShow} loading={loading}>Show</Button>
            <Button onClick={() => { setResult(null); setEmployee(undefined); }}>Close</Button>
          </Space>
        </div>
      </Card>

      {result && (
        <Card bordered={false} title="F&F Summary">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}><Statistic title="Basic" value={fmtINR(result.basic)} /></Col>
            <Col xs={24} md={8}><Statistic title="Gross Salary" value={fmtINR(result.grossSalary)} /></Col>
            <Col xs={24} md={8}><Statistic title="Net Salary" value={fmtINR(result.netSalary)} /></Col>
            <Col xs={24} md={8}><Statistic title="Notice Period (days)" value={result.noticePeriodDays ?? 0} /></Col>
            <Col xs={24} md={8}><Statistic title="Notice-Period Recovery" value={fmtINR(result.noticePeriodRecovery)} valueStyle={{ color: '#cf1322' }} /></Col>
          </Row>
          <Descriptions className="mt-4" bordered column={2} size="small">
            <Descriptions.Item label="Employee ID">{result.employeeId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Resignation Date">{result.resignationDate ? dayjs(result.resignationDate).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
            <Descriptions.Item label="Last Working Date">{result.lastWorkingDate ? dayjs(result.lastWorkingDate).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
            <Descriptions.Item label="Deductions">{fmtINR(result.deductions)}</Descriptions.Item>
            <Descriptions.Item label="Final Payable">
              <Text strong>{fmtINR((result.netSalary ?? 0) - (result.noticePeriodRecovery ?? 0))}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default FullAndFinal;

import { useState, useCallback } from 'react';
import { Modal, Input, Button, Table, Form, Tag } from 'antd';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import employeeService from '@/services/employeeService';
import type { ColumnsType } from 'antd/es/table';

interface EmployeeSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface EmployeeRow {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  joinDate?: string;
  lastWorkingDate?: string;
  companyName?: string;
  branchName?: string;
  departmentName?: string;
  designationName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export default function EmployeeSearchDialog({ open, onClose }: EmployeeSearchDialogProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmployeeRow[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const values = form.getFieldsValue();
    const params: Record<string, string> = {};

    const name = (values.employeeName || '').trim();
    if (name) params.search = name;
    if (values.employeeCode?.trim()) params.employeeId = values.employeeCode.trim();
    if (values.aadhaarNo?.trim()) params.aadhaarNo = values.aadhaarNo.trim();

    setLoading(true);
    setSearched(true);
    try {
      const res = await employeeService.getAll({ ...params, limit: '100' });
      const list = res?.data?.data ?? res?.data ?? [];
      setResults(
        list.map((emp: any) => ({
          _id: emp._id,
          employeeId: emp.employeeId || '-',
          firstName: emp.userId?.firstName || emp.firstName || '',
          lastName: emp.userId?.lastName || emp.lastName || '',
          joinDate: emp.joinDate,
          lastWorkingDate: emp.lastWorkingDate,
          companyName: typeof emp.company === 'object' ? emp.company?.name : '',
          branchName: typeof emp.branch === 'object' ? emp.branch?.name : emp.branchName || '',
          departmentName: typeof emp.department === 'object' ? emp.department?.name : '',
          designationName: typeof emp.designation === 'object' ? emp.designation?.title : '',
          email: emp.userId?.email || emp.email || '',
          phone: emp.userId?.phone || emp.phone || '',
          isActive: emp.isActive ?? true,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleClose = () => {
    form.resetFields();
    setResults([]);
    setSearched(false);
    onClose();
  };

  const columns: ColumnsType<EmployeeRow> = [
    {
      title: 'Code',
      dataIndex: 'employeeId',
      width: 100,
    },
    {
      title: 'Employee Name',
      key: 'name',
      width: 200,
      render: (_, r) => `${r.firstName} ${r.lastName}`.trim() || '-',
    },
    {
      title: 'Date / From-To',
      key: 'dates',
      width: 160,
      render: (_, r) => {
        const from = r.joinDate ? new Date(r.joinDate).toLocaleDateString('en-IN') : '-';
        const to = r.lastWorkingDate ? new Date(r.lastWorkingDate).toLocaleDateString('en-IN') : 'Present';
        return `${from} - ${to}`;
      },
    },
    {
      title: 'Company Name / Site Name',
      key: 'company',
      width: 220,
      render: (_, r) => [r.companyName, r.branchName].filter(Boolean).join(' / ') || '-',
    },
    {
      title: 'Department / Designation',
      key: 'dept',
      width: 220,
      render: (_, r) => [r.departmentName, r.designationName].filter(Boolean).join(' / ') || '-',
    },
    {
      title: 'Email Address / Mobile No.',
      key: 'contact',
      width: 200,
      render: (_, r) => (
        <div className="text-xs leading-relaxed">
          {r.email && <div>{r.email}</div>}
          {r.phone && <div>{r.phone}</div>}
          {!r.email && !r.phone && '-'}
        </div>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag>
      ),
    },
  ];

  return (
    <Modal
      title="Employee Search"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1100}
      destroyOnClose
    >
      <Form form={form} layout="inline" className="flex flex-wrap gap-y-3 mb-4">
        <Form.Item
          name="employeeName"
          label="Employee Name"
          rules={[{ required: false }]}
        >
          <Input placeholder="Enter name" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="employeeCode" label="Employee Code">
          <Input placeholder="Code" style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="aadhaarNo" label="Aadhaar No.">
          <Input placeholder="Aadhaar" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="remark" label="Remark">
          <Input placeholder="Remark" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<Search size={14} />}
            onClick={handleSearch}
            loading={loading}
          >
            {t('search')}
          </Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={results}
        columns={columns}
        rowKey="_id"
        loading={loading}
        size="small"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: searched ? 'No employees found' : 'Search to view results' }}
      />
    </Modal>
  );
}

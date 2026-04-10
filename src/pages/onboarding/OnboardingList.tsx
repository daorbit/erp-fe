import React, { useState, useEffect } from 'react';
import { Card, Table, Avatar, Tag, Button, Typography, Row, Col, Progress, Drawer, Descriptions, App, Input, Select, Popconfirm, Tabs } from 'antd';
import { Eye, UserPlus, Users, CheckCircle2, Clock, FileCheck, XCircle, Edit2, Trash2, ClipboardEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import onboardingService from '@/services/onboardingService';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from 'antd';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  pending: 'default', in_progress: 'processing', submitted: 'blue', approved: 'success', rejected: 'error',
};
const roleLabel: Record<string, string> = {
  admin: 'Company Admin', hr_manager: 'HR Manager', manager: 'Manager', employee: 'Employee', viewer: 'Viewer',
};

const OnboardingList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState<any>({});
  const [newOnboardingOpen, setNewOnboardingOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const { data: obData, isLoading } = useQuery({
    queryKey: ['onboarding', 'list'],
    queryFn: () => onboardingService.getAll(),
  });

  // Fetch users for the "New Onboarding" picker — only pending KYC users
  const { data: usersData } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => api.get<any>('/auth/users'),
    enabled: newOnboardingOpen,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, action, remarks }: { userId: string; action: string; remarks?: string }) =>
      onboardingService.review(userId, action, remarks),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['onboarding'] }); message.success('Review updated'); setSelectedRecord(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      onboardingService.adminUpdate(userId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['onboarding'] }); message.success('Onboarding updated'); setSelectedRecord(null); setDrawerMode('view'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => onboardingService.delete(userId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['onboarding'] }); message.success('Onboarding deleted'); },
  });

  const records: any[] = obData?.data ?? [];

  // Users with pending onboarding who don't already have an onboarding record
  const allUsers: any[] = usersData?.data ?? [];
  const existingUserIds = new Set(records.map((r: any) => (r.user?._id || r.user)?.toString()));
  const pendingKycUsers = allUsers.filter((u: any) =>
    u.onboardingRequired && !u.onboardingCompleted && !existingUserIds.has(u._id?.toString())
  );
  const totalCount = records.length;
  const submittedCount = records.filter((r: any) => r.status === 'submitted').length;
  const approvedCount = records.filter((r: any) => r.status === 'approved').length;
  const pendingCount = records.filter((r: any) => ['pending', 'in_progress'].includes(r.status)).length;

  // When opening edit mode, populate editData from the selected record
  useEffect(() => {
    if (drawerMode === 'edit' && selectedRecord) {
      setEditData({
        personalInfo: { ...(selectedRecord.personalInfo || {}) },
        idVerification: { ...(selectedRecord.idVerification || {}) },
        bankDetails: { ...(selectedRecord.bankDetails || {}) },
      });
    }
  }, [drawerMode, selectedRecord]);

  const stats = [
    { title: t('total'), value: totalCount, icon: <Users size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Submitted', value: submittedCount, icon: <FileCheck size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
    { title: 'Approved', value: approvedCount, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'In Progress', value: pendingCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
  ];

  const stepProgress = (r: any) => Math.round((((r.currentStep ?? 0) + (r.status === 'submitted' || r.status === 'approved' ? 1 : 0)) / 5) * 100);

  const columns = [
    {
      title: t('name'), key: 'name',
      render: (_: any, r: any) => {
        const u = r.user || {};
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A';
        return (
          <div className="flex items-center gap-3">
            <Avatar className={r.status === 'approved' ? 'bg-green-600' : 'bg-blue-600'}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div><div className="font-medium">{name}</div><div className="text-xs text-gray-400">{u.email}</div></div>
          </div>
        );
      },
    },
    { title: t('role'), key: 'role', render: (_: any, r: any) => <Tag>{roleLabel[r.user?.role] || r.user?.role || '-'}</Tag> },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [{ text: 'Pending', value: 'pending' }, { text: 'In Progress', value: 'in_progress' }, { text: 'Submitted', value: 'submitted' }, { text: 'Approved', value: 'approved' }, { text: 'Rejected', value: 'rejected' }],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s?.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Progress', key: 'progress',
      render: (_: any, r: any) => { const pct = stepProgress(r); return <div className="flex items-center gap-2 w-[120px]"><Progress percent={pct} size="small" showInfo={false} strokeColor={pct === 100 ? '#10b981' : '#3b82f6'} /><span className="text-xs text-gray-500">{pct}%</span></div>; },
    },
    { title: 'Updated', dataIndex: 'updatedAt', key: 'updatedAt', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    {
      title: t('actions'), key: 'actions', width: 160,
      render: (_: any, r: any) => (
        <div className="flex gap-1">
          <Button type="text" size="small" icon={<Eye size={14} />} onClick={() => { setSelectedRecord(r); setDrawerMode('view'); }} />
          {['pending', 'in_progress', 'rejected'].includes(r.status) && (
            <Button type="text" size="small" icon={<ClipboardEdit size={14} />} onClick={() => navigate(`/onboarding/${r.user?._id || r.user}/fill`)} />
          )}
          <Button type="text" size="small" icon={<Edit2 size={14} />} onClick={() => { setSelectedRecord(r); setDrawerMode('edit'); }} />
          <Popconfirm title="Delete this onboarding record?" onConfirm={() => deleteMutation.mutate(r.user?._id || r.user)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const sr = selectedRecord;
  const su = sr?.user || {};
  const spi = drawerMode === 'edit' ? editData.personalInfo || {} : sr?.personalInfo || {};
  const sid = drawerMode === 'edit' ? editData.idVerification || {} : sr?.idVerification || {};
  const sbd = drawerMode === 'edit' ? editData.bankDetails || {} : sr?.bankDetails || {};

  const updateEditField = (section: string, field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [section]: { ...(prev[section] || {}), [field]: value } }));
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ userId: su._id || su, data: editData });
  };

  const renderViewFields = () => (
    <div className="space-y-6">
      <Descriptions title="Personal Information" column={2} size="small" bordered>
        <Descriptions.Item label="First Name">{spi.firstName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Last Name">{spi.lastName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Date of Birth">{spi.dateOfBirth || '-'}</Descriptions.Item>
        <Descriptions.Item label="Gender">{spi.gender || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{spi.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phone">{spi.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Emergency Contact">{spi.emergencyContact || '-'}</Descriptions.Item>
        <Descriptions.Item label="Marital Status">{spi.maritalStatus || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{spi.address ? `${spi.address.street || ''}, ${spi.address.city || ''}, ${spi.address.state || ''} ${spi.address.pinCode || ''}`.trim() : '-'}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="ID Verification" column={2} size="small" bordered>
        <Descriptions.Item label="Aadhaar">{sid.aadhaarNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="PAN">{sid.panNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="Passport">{sid.passportNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="Driving License">{sid.drivingLicense || '-'}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Bank Details" column={2} size="small" bordered>
        <Descriptions.Item label="Bank">{sbd.bankName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Account Holder">{sbd.accountHolderName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Account Number">{sbd.accountNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="IFSC">{sbd.ifscCode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Account Type">{sbd.accountType || '-'}</Descriptions.Item>
      </Descriptions>
      {sr?.remarks && (
        <Descriptions title="Review" column={1} size="small" bordered>
          <Descriptions.Item label="Remarks">{sr.remarks}</Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );

  const renderEditFields = () => (
    <div className="space-y-5">
      <Text strong>Personal Information</Text>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-500">First Name</label><Input value={spi.firstName || ''} onChange={(e) => updateEditField('personalInfo', 'firstName', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Last Name</label><Input value={spi.lastName || ''} onChange={(e) => updateEditField('personalInfo', 'lastName', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Date of Birth</label><Input type="date" value={spi.dateOfBirth || ''} onChange={(e) => updateEditField('personalInfo', 'dateOfBirth', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Gender</label><Select className="w-full" value={spi.gender || undefined} onChange={(v) => updateEditField('personalInfo', 'gender', v)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></div>
        <div><label className="text-xs text-gray-500">Phone</label><Input value={spi.phone || ''} onChange={(e) => updateEditField('personalInfo', 'phone', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Emergency Contact</label><Input value={spi.emergencyContact || ''} onChange={(e) => updateEditField('personalInfo', 'emergencyContact', e.target.value)} /></div>
      </div>
      <Text strong>ID Verification</Text>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-500">Aadhaar Number</label><Input value={sid.aadhaarNumber || ''} onChange={(e) => updateEditField('idVerification', 'aadhaarNumber', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">PAN Number</label><Input value={sid.panNumber || ''} className="uppercase" onChange={(e) => updateEditField('idVerification', 'panNumber', e.target.value.toUpperCase())} /></div>
        <div><label className="text-xs text-gray-500">Passport</label><Input value={sid.passportNumber || ''} onChange={(e) => updateEditField('idVerification', 'passportNumber', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Driving License</label><Input value={sid.drivingLicense || ''} onChange={(e) => updateEditField('idVerification', 'drivingLicense', e.target.value)} /></div>
      </div>
      <Text strong>Bank Details</Text>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-500">Bank Name</label><Input value={sbd.bankName || ''} onChange={(e) => updateEditField('bankDetails', 'bankName', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Account Holder</label><Input value={sbd.accountHolderName || ''} onChange={(e) => updateEditField('bankDetails', 'accountHolderName', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">Account Number</label><Input value={sbd.accountNumber || ''} onChange={(e) => updateEditField('bankDetails', 'accountNumber', e.target.value)} /></div>
        <div><label className="text-xs text-gray-500">IFSC Code</label><Input value={sbd.ifscCode || ''} className="uppercase" onChange={(e) => updateEditField('bankDetails', 'ifscCode', e.target.value.toUpperCase())} /></div>
        <div><label className="text-xs text-gray-500">Account Type</label><Select className="w-full" value={sbd.accountType || undefined} onChange={(v) => updateEditField('bankDetails', 'accountType', v)} options={[{ value: 'savings', label: 'Savings' }, { value: 'current', label: 'Current' }, { value: 'salary', label: 'Salary' }]} /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Title level={4} className="!mb-1">{t('onboarding_list')}</Title><Text type="secondary">Track employee KYC onboarding progress</Text></div>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => { setSelectedUserId(undefined); setNewOnboardingOpen(true); }}>New Onboarding</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false}><div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}><span style={{ color: s.color }}>{s.icon}</span></div><div><Text type="secondary" className="text-xs">{s.title}</Text><div className="text-2xl font-bold">{s.value}</div></div></div></Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={records} loading={isLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      </Card>

      {/* Detail / Edit Drawer */}
      <Drawer
        title={`${drawerMode === 'edit' ? 'Edit' : 'View'} Onboarding: ${su.firstName || ''} ${su.lastName || ''}`}
        open={!!selectedRecord}
        onClose={() => { setSelectedRecord(null); setDrawerMode('view'); }}
        width={680}
        extra={
          <div className="flex gap-2">
            {drawerMode === 'view' && (
              <>
                <Button icon={<Edit2 size={14} />} onClick={() => setDrawerMode('edit')}>Edit</Button>
                {sr?.status === 'submitted' && (
                  <>
                    <Button danger icon={<XCircle size={14} />} onClick={() => reviewMutation.mutate({ userId: su._id, action: 'rejected' })} loading={reviewMutation.isPending}>Reject</Button>
                    <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={() => reviewMutation.mutate({ userId: su._id, action: 'approved' })} loading={reviewMutation.isPending}>Approve</Button>
                  </>
                )}
              </>
            )}
            {drawerMode === 'edit' && (
              <>
                <Button onClick={() => setDrawerMode('view')}>Cancel</Button>
                <Button type="primary" onClick={handleSaveEdit} loading={updateMutation.isPending}>Save Changes</Button>
              </>
            )}
          </div>
        }
      >
        {sr && (drawerMode === 'view' ? renderViewFields() : renderEditFields())}
      </Drawer>

      {/* New Onboarding — User Picker Modal */}
      <Modal
        title="Start New Onboarding"
        open={newOnboardingOpen}
        onCancel={() => setNewOnboardingOpen(false)}
        onOk={() => {
          if (!selectedUserId) { message.warning('Please select a user'); return; }
          setNewOnboardingOpen(false);
          navigate(`/onboarding/${selectedUserId}/fill`);
        }}
        okText="Start Onboarding"
        okButtonProps={{ disabled: !selectedUserId }}
      >
        <div className="py-4">
          <Text type="secondary" className="block mb-3">Select a user with pending KYC onboarding:</Text>
          <Select
            className="w-full"
            placeholder={pendingKycUsers.length ? 'Search and select user...' : 'No users with pending KYC'}
            showSearch
            optionFilterProp="label"
            value={selectedUserId}
            onChange={setSelectedUserId}
            disabled={pendingKycUsers.length === 0}
            options={pendingKycUsers.map((u: any) => ({
              value: u._id,
              label: `${u.firstName || ''} ${u.lastName || ''} (${u.email})`.trim(),
            }))}
          />
          {pendingKycUsers.length === 0 && allUsers.length > 0 && (
            <Text type="secondary" className="block mt-2 text-xs">
              All users with onboarding requirement already have records. Enable onboarding for a user in User Management first.
            </Text>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OnboardingList;

import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Button, Space, Typography, App, Transfer } from 'antd';
import api from '@/services/api';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useUserRight, useSaveUserRight, useCopyUserRight } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

// Master list of page/entity codes — expand this as more pages are added.
const ALL_PAGES = [
  'employees.add', 'employees.list', 'employees.edit',
  'departments.add', 'departments.list',
  'designations.add', 'designations.list',
  'leave.apply', 'leave.approve',
  'salary.view', 'salary.edit',
  'attendance.view', 'attendance.edit',
];

const UserRightsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [branchId, setBranchId] = useState<string | undefined>();
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  const { data: myCompanyData } = useMyCompany();
  const companyOptions = myCompanyData?.data
    ? [{ value: myCompanyData.data._id || myCompanyData.data.id, label: myCompanyData.data.name }]
    : [];
  const { data: branches } = useBranchList();
  const { data: currentRights, refetch } = useUserRight(userId, branchId);
  const save = useSaveUserRight();
  const copy = useCopyUserRight();

  useEffect(() => {
    api.get<any>('/admin/users').then((res) => setUsers(res?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentRights?.data?.allowedPages) setTargetKeys(currentRights.data.allowedPages);
    else setTargetKeys([]);
  }, [currentRights]);

  const handleShow = () => refetch();

  const handleSave = async () => {
    if (!userId || !branchId) { message.error('Pick a user and branch'); return; }
    try {
      await save.mutateAsync({ user: userId, branch: branchId, allowedPages: targetKeys });
      message.success('Rights saved');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  const handleCopy = () => {
    let fromUser = '';
    modal.confirm({
      title: 'Copy rights from another user',
      content: (
        <div className="mt-2">
          <Select
            className="w-full" placeholder="Select source user" showSearch optionFilterProp="label"
            onChange={(v) => { fromUser = v; }}
            options={users.map((u) => ({ value: u._id || u.id, label: u.username || u.firstName }))}
          />
        </div>
      ),
      onOk: async () => {
        if (!fromUser || !userId || !branchId) { message.error('Pick source, target and branch'); return; }
        try {
          await copy.mutateAsync({ fromUser, toUser: userId, branch: branchId });
          message.success('Rights copied'); refetch();
        } catch (err: any) {
          message.error(err?.message || 'Failed');
        }
      },
    });
  };

  const opts = (list: any[], label = 'name') => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x[label] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">User Rights</Title>
        <Button type="link" onClick={handleCopy}>Copy User</Button>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          <Form.Item label="User Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Please Select" value={userId} onChange={setUserId} showSearch optionFilterProp="label"
              options={users.map((u) => ({ value: u._id || u.id, label: u.username || u.firstName }))} />
          </Form.Item>
          <Form.Item label="Company Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Select placeholder="Please Select" options={companyOptions} />
          </Form.Item>
          <Form.Item label="Branch Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Please Select" value={branchId} onChange={setBranchId} options={opts(branches?.data ?? [])} />
          </Form.Item>
        </Form>
        <div className="flex justify-center gap-2 mb-4">
          <Button type="primary" onClick={handleShow}>Show</Button>
          <Button onClick={() => { form.resetFields(); setTargetKeys([]); setUserId(undefined); setBranchId(undefined); }}>Close</Button>
        </div>

        {userId && branchId && (
          <>
            <Transfer
              dataSource={ALL_PAGES.map((p) => ({ key: p, title: p }))}
              showSearch
              targetKeys={targetKeys}
              onChange={(keys) => setTargetKeys(keys as string[])}
              render={(item) => item.title as string}
              listStyle={{ width: 320, height: 400 }}
              titles={['Available pages', 'Allowed pages']}
            />
            <div className="flex justify-center mt-4">
              <Space>
                <Button type="primary" onClick={handleSave} loading={save.isPending}>Save Rights</Button>
              </Space>
            </div>
          </>
        )}

        <div className="mt-6 text-xs leading-5 border-t pt-4">
          <div><b>1. SUPERADMIN</b> — Full rights across the entire platform.</div>
          <div><b>2. ADMIN</b> — Full rights on their assigned module only.</div>
          <div><b>3. HO-USER</b> — Can see all site data module-wise, with per-page rights.</div>
          <div><b>4. SITE-ADMIN</b> — Full rights for their assigned site only.</div>
          <div><b>5. USER</b> — Access to assigned modules and their assigned functionality.</div>
        </div>
      </Card>
    </div>
  );
};

export default UserRightsPage;

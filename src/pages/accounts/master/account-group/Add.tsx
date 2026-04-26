import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Select, Button, Space, Radio, Typography, App,
} from 'antd';
import { List as ListIcon } from 'lucide-react';
import {
  useAccountGroupList,
  useCreateAccountGroup,
  useUpdateAccountGroup,
} from '@/hooks/queries/useAccountGroups';

const { Title, Text } = Typography;

const GROUP_NATURE_OPTIONS = [
  { value: 'ASSETS', label: 'ASSETS' },
  { value: 'EXPENSES', label: 'EXPENSES' },
  { value: 'INCOME', label: 'INCOME' },
  { value: 'LIABILITY', label: 'LIABILITY' },
];

const SCHEDULE_GROUP_OPTIONS = [
  '(A) MSME',
  '(B) OTHERS',
  'AFTER EXTRAORDINARY ADJUSTMENT',
  'BASIC',
  'BEFORE EXTRAORDINARY ITEMS',
  'CAPITAL WORK-IN-PROGRESS',
  'CASH AND CASH EQUIVALENTS',
  'COST OF CONSTRUCTION',
  'CURRENT INVESTMENTS',
  'CURRENT TAX',
  'DEFERRED TAX',
  'DEFERRED TAX ASSETS (NET)',
  'DEFERRED TAX LIABILITIES (NET)',
  'DEPRECIATION AND AMORTIZATION EXPENSES',
  'EMPLOYEE BENEFIT EXPENSES',
  'EXCEPTIONAL ITEMS',
  'EXCESS/SHORT PROVISION RELATING EARLIER YEAR TAX',
  'EXPENSES PAYABLE',
  'EXTRAORDINARY ITEMS',
  'FINANCE COSTS',
  'FIXED ASSETS',
  'GENERAL RESERVES AND SURPLUS',
  'INVENTORIES',
  'LONG TERM BORROWINGS',
  'LONG TERM PROVISIONS',
  'LONG-TERM LOANS AND ADVANCES',
  'MISCELLANEOUS EXPENSES',
  'OTHER CURRENT ASSETS',
  'OTHER CURRENT LIABILITIES',
  'OTHER INCOME',
  'OTHER LONG-TERM LIABILITIES',
  'OTHER NON-CURRENT ASSETS',
  'REVENUE FROM OPERATIONS',
  'SHARE CAPITAL',
  'SHORT-TERM BORROWINGS',
  'SHORT-TERM LOANS AND ADVANCES',
  'SHORT-TERM PROVISIONS',
  'TRADE PAYABLES',
  'TRADE RECEIVABLES',
].map((s) => ({ value: s, label: s }));

const AccountGroupAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateAccountGroup();
  const updateMutation = useUpdateAccountGroup();
  const { data: listData } = useAccountGroupList();

  const isEdit = !!id;
  const editData = isEdit
    ? (listData?.data ?? []).find((d: any) => (d._id || d.id) === id)
    : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        isMainGroup: editData.isMainGroup !== false,
        scheduleGroup: editData.scheduleGroup,
        orderNo: editData.orderNo ?? 0,
        groupNature: editData.groupNature,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Account Group updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Account Group created');
      }
      navigate('/accounts/master/account-group/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} Account Group`);
    }
  };

  return (
    <div className="space-y-0">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{   color: '#fff' }}
      >
        <Title level={5} className="!mb-0 !text-white">Account Group</Title>
        <Button
          type="text"
          icon={<ListIcon size={16} />}
          style={{ color: '#fff' }}
          onClick={() => navigate('/accounts/master/account-group/list')}
        >
          List
        </Button>
      </div>

      {/* Mode label */}
      <div className="text-center py-2">
        <Text type="danger" strong>{isEdit ? 'Edit Mode' : 'New Mode'}</Text>
      </div>

      <Card bordered={false} className="mx-4">
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{ isMainGroup: true, orderNo: 0 }}
        >
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {/* Left column */}
            <div>
              <Form.Item
                name="name"
                label={<><Text type="danger">* </Text>Account Group Name</>}
                rules={[{ required: true, message: 'Account Group Name is required' }]}
              >
                <Input autoFocus maxLength={150} />
              </Form.Item>

              <Form.Item name="isMainGroup" label="Is Main Group">
                <Radio.Group>
                  <Radio value={true}>YES</Radio>
                  <Radio value={false}>NO</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="scheduleGroup" label="Schedule Group">
                <Select
                  placeholder="Please Select"
                  allowClear
                  showSearch
                  options={SCHEDULE_GROUP_OPTIONS}
                  filterOption={(input, opt) =>
                    (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  listHeight={256}
                />
              </Form.Item>
            </div>

            {/* Right column */}
            <div>
              <Form.Item name="orderNo" label="Order No">
                <InputNumber min={0} className="!w-full" />
              </Form.Item>

              <Form.Item
                name="groupNature"
                label={<><Text type="danger">* </Text>Group Nature</>}
                rules={[{ required: true, message: 'Group Nature is required' }]}
              >
                <Select
                  placeholder="Please select"
                  options={GROUP_NATURE_OPTIONS}
                />
              </Form.Item>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center mt-4">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{ background: '#8B1A1A', borderColor: '#8B1A1A' }}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                Save
              </Button>
              <Button
                danger
                onClick={() => navigate('/accounts/master/account-group/list')}
              >
                Close
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AccountGroupAdd;

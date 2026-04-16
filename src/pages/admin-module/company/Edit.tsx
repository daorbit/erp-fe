import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Tabs, Button, Space, Typography, DatePicker, Select,
  Upload, Checkbox, Table, App,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, List as ListIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import companyService from '@/services/companyService';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Generate fin-year options ───────────────────────────────────────────────
function genFinYears() {
  const now = new Date().getFullYear();
  const opts = [];
  for (let y = now - 5; y <= now + 2; y++) {
    opts.push({ value: `01/04/${y}-31/03/${y + 1}`, label: `01/04/${y}-31/03/${y + 1}` });
  }
  return opts;
}
const FIN_YEAR_OPTIONS = genFinYears();

// ─── Two-column form row helper ──────────────────────────────────────────────
function FRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{children}</div>;
}

function FItem({ label, name, children, required }: { label: string; name: string; children?: React.ReactNode; required?: boolean }) {
  return (
    <Form.Item
      label={label}
      name={name}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 15 }}
      rules={required ? [{ required: true, message: `${label} is required` }] : undefined}
    >
      {children || <Input />}
    </Form.Item>
  );
}

export default function CompanyEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Fetch company
  const { data, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) {
      const c = data.data;
      form.setFieldsValue({
        ...c,
        // Flatten address
        address01: c.address?.street,
        city: c.address?.city,
        state: c.address?.state,
        pinCode: c.address?.zipCode,
        // Date fields
        lutDate: c.lutDate ? dayjs(c.lutDate) : undefined,
        // Documents & IT Returns
        documents: c.documents || [],
        itReturns: (c.itReturns || []).map((it: any) => ({
          ...it,
          fillingDate: it.fillingDate ? dayjs(it.fillingDate) : undefined,
        })),
      });
    }
  }, [data, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: any = {
        ...values,
        address: {
          street: values.address01,
          city: values.city,
          state: values.state,
          zipCode: values.pinCode,
          country: 'India',
        },
        lutDate: values.lutDate?.toISOString(),
        itReturns: (values.itReturns || []).map((it: any) => ({
          ...it,
          fillingDate: it.fillingDate?.toISOString(),
        })),
      };

      // Clean up flattened fields
      delete payload.address01;
      delete payload.city;
      delete payload.state;
      delete payload.pinCode;

      await companyService.update(id!, payload);
      message.success('Company updated');
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ─── Tab 1: Address Details ──────────────────────────────────────────────
  const addressTab = (
    <div className="py-4">
      <FRow>
        <FItem label="Name" name="name" required><Input /></FItem>
        <FItem label="Short Name" name="code"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Sign For" name="signFor"><Input /></FItem>
        <FItem label="Contact Person" name="contactPerson"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Address 01" name="address01"><TextArea rows={2} /></FItem>
        <FItem label="Address 02" name="address02"><TextArea rows={2} /></FItem>
      </FRow>
      <FRow>
        <FItem label="Address 03" name="address03"><TextArea rows={2} /></FItem>
        <FItem label="City" name="city"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Phone No.1" name="phone"><Input /></FItem>
        <FItem label="Pin Code" name="pinCode"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Phone No.2" name="phone2"><Input /></FItem>
        <FItem label="Fax No.1" name="faxNo1"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Fax No.2" name="faxNo2"><Input /></FItem>
        <FItem label="Email Id" name="email"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Company Website" name="website"><Input /></FItem>
        <FItem label="Director Name" name="directorName"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Father Name" name="fatherName"><Input /></FItem>
        <FItem label="Designation" name="designation"><Input /></FItem>
      </FRow>
    </div>
  );

  // ─── Tab 2: Tax Details ──────────────────────────────────────────────────
  const taxTab = (
    <div className="py-4">
      <FRow>
        <FItem label="PF Prefix" name="pfPrefix"><Input /></FItem>
        <FItem label="TIN No." name="tinNo"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="TAN No." name="tanNo"><Input /></FItem>
        <FItem label="PAN No." name="panNumber"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="ST No. 1" name="stNo1"><Input /></FItem>
        <FItem label="ST No. 2" name="stNo2"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="CST No. 1" name="cstNo1"><Input /></FItem>
        <FItem label="CST No. 2" name="cstNo2"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="LUT / Bond No." name="lutBondNo"><Input /></FItem>
        <FItem label="GST Number" name="gstNumber"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="LUT Date" name="lutDate"><DatePicker className="w-full" /></FItem>
        <FItem label="MSME" name="msme"><Input /></FItem>
      </FRow>
    </div>
  );

  // ─── Tab 3: Other Details ────────────────────────────────────────────────
  const otherTab = (
    <div className="py-4">
      <FRow>
        <FItem label="CIN No." name="cinNo"><Input /></FItem>
        <FItem label="ECC No. 1" name="eccNo1"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="ECC No. 2" name="eccNo2"><Input /></FItem>
        <FItem label="Range" name="range"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Division" name="division"><Input /></FItem>
        <FItem label="Commissionerate" name="commissionerate"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="CTH No." name="cthNo"><Input /></FItem>
        <FItem label="Reg. Off. Name" name="regOffName"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Reg. Off. Address" name="regOffAddress"><TextArea rows={2} /></FItem>
        <FItem label="Remark" name="remark"><TextArea rows={2} /></FItem>
      </FRow>
      <FRow>
        <FItem label="Reg. Off. Pin Code" name="regOffPinCode"><Input /></FItem>
        <FItem label="Reg. Off. Phone No." name="regOffPhoneNo"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Reg. Off. City" name="regOffCity"><Input /></FItem>
        <div />
      </FRow>
    </div>
  );

  // ─── Tab 4: Logo ─────────────────────────────────────────────────────────
  const logoTab = (
    <div className="py-4">
      <FRow>
        <FItem label="Logo Image (Left)" name="logoLeft"><Input placeholder="URL or upload path" /></FItem>
        <FItem label="Logo Image (Right)" name="logoRight"><Input placeholder="URL or upload path" /></FItem>
      </FRow>
      <FRow>
        <FItem label="Header Image (PDF)" name="headerImage"><Input placeholder="URL or upload path" /></FItem>
        <FItem label="Footer Image (PDF)" name="footerImage"><Input placeholder="URL or upload path" /></FItem>
      </FRow>
      <Text type="secondary" className="block text-center text-xs mb-4">Upload Image Size: 980*120 TO 992*145</Text>
      <FRow>
        <FItem label="Attachment of Stamp" name="stampImage"><Input placeholder="URL or upload path" /></FItem>
        <div />
      </FRow>
    </div>
  );

  // ─── Tab 5: Document (dynamic list) ──────────────────────────────────────
  const documentTab = (
    <div className="py-4">
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            <div className="flex justify-end mb-2">
              <Button type="primary" size="small" danger onClick={() => add()}>Add</Button>
            </div>
            <Table
              dataSource={fields}
              pagination={false}
              size="small"
              rowKey="key"
              columns={[
                {
                  title: 'Document Name', key: 'name', width: 250,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'documentName']} noStyle>
                      <Input />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Document Remark', key: 'remark', width: 250,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'documentRemark']} noStyle>
                      <Input />
                    </Form.Item>
                  ),
                },
                {
                  title: 'File', key: 'file', width: 200,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'file']} noStyle>
                      <Input placeholder="File path" />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Whatsapp Email', key: 'wa', width: 120,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'whatsappEmail']} valuePropName="checked" noStyle>
                      <Checkbox />
                    </Form.Item>
                  ),
                },
                {
                  title: '', key: 'del', width: 60,
                  render: (_, field) => (
                    <Button type="primary" danger size="small" onClick={() => remove(field.name)}>Del</Button>
                  ),
                },
              ]}
            />
          </>
        )}
      </Form.List>
    </div>
  );

  // ─── Tab 6: IT Return (dynamic list) ─────────────────────────────────────
  const itReturnTab = (
    <div className="py-4">
      <Form.List name="itReturns">
        {(fields, { add, remove }) => (
          <>
            <div className="flex justify-end mb-2">
              <Button type="primary" size="small" danger onClick={() => add()}>Add</Button>
            </div>
            <Table
              dataSource={fields}
              pagination={false}
              size="small"
              rowKey="key"
              columns={[
                {
                  title: 'Fin Year', key: 'fy', width: 220,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'finYear']} noStyle>
                      <Select options={FIN_YEAR_OPTIONS} placeholder="Select" style={{ width: '100%' }} />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Filling Date', key: 'date', width: 160,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'fillingDate']} noStyle>
                      <DatePicker className="w-full" />
                    </Form.Item>
                  ),
                },
                {
                  title: 'Acknowledgement No', key: 'ack', width: 200,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'acknowledgementNo']} noStyle>
                      <Input />
                    </Form.Item>
                  ),
                },
                {
                  title: 'File', key: 'file', width: 200,
                  render: (_, field) => (
                    <Form.Item name={[field.name, 'file']} noStyle>
                      <Input placeholder="File path" />
                    </Form.Item>
                  ),
                },
                {
                  title: '', key: 'del', width: 60,
                  render: (_, field) => (
                    <Button type="primary" danger size="small" onClick={() => remove(field.name)}>Del</Button>
                  ),
                },
              ]}
            />
          </>
        )}
      </Form.List>
    </div>
  );

  const tabItems = [
    { key: 'address', label: 'Address Details', children: addressTab },
    { key: 'tax', label: 'Tax Details', children: taxTab },
    { key: 'other', label: 'Other Details', children: otherTab },
    { key: 'logo', label: 'Logo', children: logoTab },
    { key: 'document', label: 'Document', children: documentTab },
    { key: 'itReturn', label: 'IT Return', children: itReturnTab },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Company Master</Title>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/admin-module/master/company/list')}
        >
          List
        </Button>
      </div>

      <Text type="danger" className="block text-center font-medium">Edit Mode</Text>

      <Card bordered={false} className="!rounded-lg !shadow-sm" loading={isLoading}>
        <Form form={form} layout="horizontal" size="small">
          <Tabs items={tabItems} type="card" />

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/company/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

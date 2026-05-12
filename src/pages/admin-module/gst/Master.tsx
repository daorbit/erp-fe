import React, { useMemo, useState } from 'react';
import {
  Card, Form, Input, Button, Select, Checkbox, Table, Typography, App,
  Modal, DatePicker, Upload, Popconfirm,
} from 'antd';
import { Edit, Trash2, Upload as UploadIcon, Ban } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyGstService from '@/services/companyGstService';
import stateService from '@/services/stateService';
import { cityHooks } from '@/hooks/queries/useMasterOther';

const { Title, Text } = Typography;
const { TextArea } = Input;

type Mode = 'new' | 'edit';

export default function CompanyGstMaster() {
  const { message } = App.useApp();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const { data: citiesData } = cityHooks.useList();
  const cityOptions = (citiesData?.data ?? []).map((c: any) => ({ value: c.name, label: c.name }));

  const [mode, setMode] = useState<Mode>('new');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  // Modals
  const [addressModal, setAddressModal] = useState<{ open: boolean; gst?: any }>({ open: false });
  const [addressForm] = Form.useForm();
  const [eInvoiceModal, setEInvoiceModal] = useState<{ open: boolean; gst?: any }>({ open: false });
  const [eInvoiceForm] = Form.useForm();

  // ─── Queries ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['company-gsts-list'],
    queryFn: () => companyGstService.getAll({ limit: '500' }),
  });
  const rows: any[] = ((data as any)?.data ?? []) as any[];

  const { data: statesData } = useQuery({
    queryKey: ['states-master'],
    queryFn: () => stateService.getAll({ limit: '200' }),
  });
  const states: any[] = ((statesData as any)?.data ?? []) as any[];

  // ─── Mutations ───────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['company-gsts-list'] });

  const createMut = useMutation({
    mutationFn: (data: any) => companyGstService.create(data),
    onSuccess: () => { invalidate(); message.success('GST entry created'); resetForm(); },
    onError: (err: any) => message.error(err?.message || 'Failed to create'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companyGstService.update(id, data),
    onSuccess: () => { invalidate(); message.success('GST entry updated'); resetForm(); },
    onError: (err: any) => message.error(err?.message || 'Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => companyGstService.delete(id),
    onSuccess: () => { invalidate(); message.success('GST entry deleted'); },
  });
  const addAddressMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companyGstService.addAddress(id, data),
    onSuccess: () => { invalidate(); message.success('Address added'); setAddressModal({ open: false }); addressForm.resetFields(); },
    onError: (err: any) => message.error(err?.message || 'Failed to add address'),
  });
  const removeAddressMut = useMutation({
    mutationFn: ({ id, addressId }: { id: string; addressId: string }) =>
      companyGstService.removeAddress(id, addressId),
    onSuccess: () => { invalidate(); message.success('Address removed'); },
  });
  const saveEInvoiceMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companyGstService.saveEInvoice(id, data),
    onSuccess: () => { invalidate(); message.success('E-invoice credentials saved'); setEInvoiceModal({ open: false }); eInvoiceForm.resetFields(); },
    onError: (err: any) => message.error(err?.message || 'Failed to save'),
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    form.resetFields();
    setAttachmentUrl(undefined);
    setMode('new');
    setEditingId(null);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const matchedState = states.find((s) => s.name === values.state);
      const payload = {
        ...values,
        stateCode: matchedState?.stateCode,
        attachmentUrl,
      };
      if (mode === 'edit' && editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Save failed');
    }
  };

  const onEdit = (row: any) => {
    setMode('edit');
    setEditingId(row._id || row.id);
    form.setFieldsValue({
      state: row.state,
      gstNumber: row.gstNumber,
      provisionId: row.provisionId,
      contactPerson: row.contactPerson,
      contactNo: row.contactNo,
      address: row.address,
      city: row.city,
      pinCode: row.pinCode,
      invoiceCode: row.invoiceCode,
      remark: row.remark,
      isISD: !!row.isISD,
    });
    setAttachmentUrl(row.attachmentUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  // Client-side column filters
  const filteredRows = useMemo(() => rows.filter((r) => {
    for (const [k, v] of Object.entries(colFilters)) {
      if (!v) continue;
      const val = (() => {
        switch (k) {
          case 'company': return typeof r.company === 'object' ? r.company?.name : '';
          case 'state': return r.state;
          case 'gstNumber': return r.gstNumber;
          case 'provisionId': return r.provisionId;
          case 'address': return [r.address, r.remark].filter(Boolean).join(' / ');
          case 'contact': return [r.contactPerson, r.contactNo].filter(Boolean).join(' ');
          case 'city': return r.city;
          case 'pinCode': return r.pinCode;
          case 'isd': return r.isISD ? 'Yes' : 'No';
          default: return '';
        }
      })();
      if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  }), [rows, colFilters]);

  // ─── Table columns ───────────────────────────────────────────────────────
  const columns = [
    { title: <div><div>SrNo.</div>{filterCell('sr')}</div>,
      key: 'sr', width: 70, render: (_: any, __: any, i: number) => i + 1 },
    { title: <div><div>Company Name</div>{filterCell('company')}</div>,
      key: 'company', render: (_: any, r: any) => typeof r.company === 'object' ? r.company?.name : '' },
    { title: <div><div>State</div>{filterCell('state')}</div>,
      dataIndex: 'state', key: 'state', width: 160 },
    { title: <div><div>GST Number</div>{filterCell('gstNumber')}</div>,
      dataIndex: 'gstNumber', key: 'gstNumber', width: 170 },
    { title: <div><div>Provision ID</div>{filterCell('provisionId')}</div>,
      dataIndex: 'provisionId', key: 'provisionId', width: 130 },
    {
      title: <div><div>Address / Remark</div>{filterCell('address')}</div>,
      key: 'address', width: 220,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <Button size="small" type="text" icon={<UploadIcon size={14} />}
            onClick={() => setAddressModal({ open: true, gst: r })} />
          <span className="text-xs">{[r.address, r.remark].filter(Boolean).join(' / ')}</span>
        </div>
      ),
    },
    { title: <div><div>Contact Person / No.</div>{filterCell('contact')}</div>,
      key: 'contact', width: 180,
      render: (_: any, r: any) => (
        <div className="text-xs">
          <div>{r.contactPerson}</div>
          <div>{r.contactNo}</div>
        </div>
      ),
    },
    { title: <div><div>City</div>{filterCell('city')}</div>, dataIndex: 'city', key: 'city', width: 110 },
    { title: <div><div>Pin Code</div>{filterCell('pinCode')}</div>, dataIndex: 'pinCode', key: 'pinCode', width: 100 },
    { title: <div><div>ISD</div>{filterCell('isd')}</div>, key: 'isd', width: 70,
      render: (_: any, r: any) => r.isISD ? 'Yes' : 'No' },
    {
      title: 'Doc', key: 'doc', width: 80,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-1">
          {r.attachmentUrl
            ? <a href={r.attachmentUrl} target="_blank" rel="noreferrer"><UploadIcon size={14} /></a>
            : <UploadIcon size={14} className="text-gray-400" />}
          <Button size="small" type="text"
            title="E-Invoice User"
            icon={<Ban size={14} />}
            onClick={() => { setEInvoiceModal({ open: true, gst: r }); eInvoiceForm.setFieldsValue({ apiUser: r.eInvoiceApiUser, apiPassword: r.eInvoiceApiPassword }); }}
          />
        </div>
      ),
    },
    {
      title: 'Edit', key: 'edit', width: 70,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-1">
          <Button size="small" type="text" icon={<Edit size={14} />} onClick={() => onEdit(r)} />
          <Popconfirm title="Delete this GST entry?" onConfirm={() => deleteMut.mutate(r._id || r.id)}>
            <Button size="small" type="text" danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Expanded row → show address history
  const expandedRowRender = (row: any) => {
    const list = (row.addresses ?? []) as any[];
    if (list.length === 0) return <div className="text-xs text-gray-500 px-3 py-2">No address history</div>;
    return (
      <Table
        size="small"
        pagination={false}
        rowKey={(_, i) => String(i)}
        dataSource={list}
        columns={[
          { title: 'Effective Date', dataIndex: 'effectiveDate', key: 'd', width: 150,
            render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
          { title: 'Address', dataIndex: 'address', key: 'a' },
          { title: 'City', dataIndex: 'city', key: 'c', width: 140 },
          { title: 'Pin Code', dataIndex: 'pinCode', key: 'p', width: 110 },
          {
            title: 'Del', key: 'del', width: 60,
            render: (_: any, addr: any) => (
              <Popconfirm title="Remove this address?"
                onConfirm={() => removeAddressMut.mutate({ id: row._id || row.id, addressId: addr._id })}>
                <Button size="small" danger type="text" icon={<Trash2 size={12} />} />
              </Popconfirm>
            ),
          },
        ]}
      />
    );
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Company GST Master</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">
          {mode === 'edit' ? 'Edit Mode' : 'New Mode'}
        </Text>

        <Form form={form} layout="horizontal" size="small" initialValues={{ isISD: false }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <Form.Item label={<span>GST State<span className="text-red-500">*</span></span>}
              name="state" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}
              rules={[{ required: true, message: 'GST State is required' }]}>
              <Select
                placeholder="Please Select"
                showSearch
                options={states.map((s) => ({ value: s.name, label: s.name }))}
              />
            </Form.Item>
            <Form.Item label={<span>GST Number<span className="text-red-500">*</span></span>}
              name="gstNumber" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}
              rules={[{ required: true, message: 'GST Number is required' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Provision ID" name="provisionId" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <Input />
            </Form.Item>
            <div className="grid grid-cols-2 gap-x-3">
              <Form.Item label="Contact Person" name="contactPerson" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                <Input />
              </Form.Item>
              <Form.Item label="Cont. No." name="contactNo" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
                <Input />
              </Form.Item>
            </div>

            <Form.Item label="Address" name="address" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <TextArea rows={1} />
            </Form.Item>
            <Form.Item label="City" name="city" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <Select showSearch optionFilterProp="label" placeholder="Select city" options={cityOptions} allowClear />
            </Form.Item>

            <div className="grid grid-cols-2 gap-x-3">
              <Form.Item label="Pin Code" name="pinCode" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                <Input />
              </Form.Item>
              <Form.Item label="Invoice Code" name="invoiceCode" labelCol={{ span: 11 }} wrapperCol={{ span: 13 }}>
                <Input />
              </Form.Item>
            </div>
            <Form.Item label="Remark" name="remark" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <Input />
            </Form.Item>

            <Form.Item label="ISD" name="isISD" valuePropName="checked" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <Checkbox />
            </Form.Item>
            <Form.Item label="Attach Document" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
              <Upload
                maxCount={1}
                action="/api/v1/upload"
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    setAttachmentUrl(info.file.response?.url || info.file.response?.data?.url);
                  }
                }}
              >
                <Button size="small" icon={<UploadIcon size={14} />}>Choose File</Button>
              </Upload>
              {attachmentUrl && <span className="text-xs ml-2">{attachmentUrl.split('/').pop()}</span>}
            </Form.Item>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={createMut.isPending || updateMut.isPending} onClick={onSubmit}>
              Save
            </Button>
            <Button danger onClick={() => { form.resetFields(); setAttachmentUrl(undefined); }}>
              Reset
            </Button>
            <Button danger onClick={resetForm}>Close</Button>
          </div>
        </Form>
      </Card>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filteredRows}
          columns={columns}
          rowKey={(r) => r._id || r.id}
          loading={isLoading}
          size="small"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          expandable={{ expandedRowRender }}
        />
      </Card>

      {/* ─── Address Update modal ──────────────────────────────────────────── */}
      <Modal
        open={addressModal.open}
        title="GST Address Update With Effective Date"
        onCancel={() => setAddressModal({ open: false })}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Text type="danger" className="block text-center font-medium mb-4">NEW MODE</Text>
        <Form form={addressForm} layout="horizontal" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-2">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">State Name :</span>
              <span className="font-semibold">{addressModal.gst?.state}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">GST Number :</span>
              <span className="font-semibold">{addressModal.gst?.gstNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <Form.Item label="Effective Date" name="effectiveDate" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Effective date is required' }]}
              initialValue={dayjs()}>
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Address" name="address" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Input />
            </Form.Item>
            <Form.Item label="City" name="city" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select showSearch optionFilterProp="label" placeholder="Select city" options={cityOptions} allowClear />
            </Form.Item>
            <Form.Item label="Pin Code" name="pinCode" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Input />
            </Form.Item>
          </div>

          <div className="flex justify-center mt-3">
            <Button type="primary" danger loading={addAddressMut.isPending}
              onClick={async () => {
                try {
                  const v = await addressForm.validateFields();
                  await addAddressMut.mutateAsync({
                    id: addressModal.gst?._id || addressModal.gst?.id,
                    data: { ...v, effectiveDate: (v.effectiveDate as Dayjs).toISOString() },
                  });
                } catch (err: any) {
                  if (err?.errorFields) return;
                }
              }}>
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ─── E-Invoice User modal ──────────────────────────────────────────── */}
      <Modal
        open={eInvoiceModal.open}
        title="GST E-Invoice User - Password"
        onCancel={() => setEInvoiceModal({ open: false })}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Text type="danger" className="block text-center font-medium mb-4">NEW MODE</Text>
        <Form form={eInvoiceForm} layout="horizontal" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-2">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">State Name :</span>
              <span className="font-semibold">{eInvoiceModal.gst?.state}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">GST Number :</span>
              <span className="font-semibold">{eInvoiceModal.gst?.gstNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <Form.Item label="API User Name" name="apiUser" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
              <Input />
            </Form.Item>
            <Form.Item label="API Password" name="apiPassword" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
              <Input.Password />
            </Form.Item>
          </div>

          <div className="flex justify-center mt-3">
            <Button type="primary" danger loading={saveEInvoiceMut.isPending}
              onClick={async () => {
                const v = await eInvoiceForm.validateFields();
                await saveEInvoiceMut.mutateAsync({
                  id: eInvoiceModal.gst?._id || eInvoiceModal.gst?.id,
                  data: v,
                });
              }}>
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

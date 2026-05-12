import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Tabs, Button, Select, DatePicker, Checkbox, InputNumber,
  Table, Typography, Modal, Space, Radio, App, Popover,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon, Info, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import branchService from '@/services/branchService';
import { cityHooks } from '@/hooks/queries/useMasterOther';
import { useAppSelector } from '@/store';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SITE_TYPE_OPTIONS = [
  { value: 'annuity', label: 'ANNUITY' },
  { value: 'bot', label: 'BOT' },
  { value: 'epc', label: 'EPC' },
  { value: 'ham', label: 'HAM' },
  { value: 'omt', label: 'OMT' },
  { value: 'plant', label: 'PLANT' },
  { value: 'site', label: 'SITE' },
  { value: 'toll', label: 'TOLL' },
  { value: 'tot', label: 'TOT' },
  { value: 'township', label: 'TOWNSHIP' },
  { value: 'spv', label: 'SPV' },
  { value: 'busport', label: 'BUSPORT' },
  { value: 'joint_venture', label: 'JOINT VENTURE' },
  { value: 'security', label: 'SECURITY' },
  { value: 'pe', label: 'P&E (Plant And Equipment)' },
  { value: 'others', label: 'OTHERS' },
  { value: 'morth', label: 'MORTH' },
  { value: 'only_supply', label: 'Only Supply' },
  { value: 'supply_and_installation', label: 'Supply And Installation' },
  { value: 'sitc_of_rwh', label: 'SITC Of RWH' },
  { value: 'erection', label: 'ERECTION' },
  { value: 'crash_barrier', label: 'CRASH BARRIER' },
];

const SITE_TYPE_INFO = (
  <div className="text-sm max-w-md space-y-1">
    <div><b>ANNUITY</b> - Only Yearly Payment Basis</div>
    <div><b>BOT</b> - Build Operate and Transfer.</div>
    <div><b>EPC</b> - Engeneering, Procurement and Construction</div>
    <div><b>TOWN SHIP</b> - Self Build and Sale By CO.</div>
    <div><b>OMT</b> - Operate Maintain Transfer</div>
    <div><b>TOLL + ANNUITY</b> - Toll Collection OR Annuity Given By Govt.</div>
    <div><b>TOT</b> - Toll Operate Transfer</div>
    <div><b>HAM</b> - Hybride Annuity Maint.( 40% PAYMENT DONE BY GOVT. ON CONSTRUCTION TIME AND 60% AMOUNT GIVEN TO YEARLY BASIS) BUT TOLL COLLECTION NOT APPROVED.</div>
  </div>
);

function FRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{children}</div>;
}

function FItem({ label, name, children, required, tooltip }: { label: string; name: string; children?: React.ReactNode; required?: boolean; tooltip?: string }) {
  return (
    <Form.Item label={label} name={name} tooltip={tooltip}
      rules={required ? [{ required: true, message: `${label} is required` }] : undefined}>
      {children || <Input />}
    </Form.Item>
  );
}

export default function SiteAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locModal, setLocModal] = useState<{ open: boolean; siteId: string; siteName: string }>(
    { open: false, siteId: '', siteName: '' },
  );
  const user = useAppSelector((s) => s.auth.user);
  const companyName = typeof user?.company === 'object' ? user.company.name : '';
  const { data: citiesData } = cityHooks.useList();
  const cityOptions = (citiesData?.data ?? []).map((c: any) => ({ value: c.name, label: c.name }));

  // ─── Load existing site on edit ──────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    setLoading(true);
    branchService.getById(id).then((res: any) => {
      if (cancelled) return;
      const b = res?.data ?? res;
      if (!b) return;
      form.setFieldsValue({
        ...b,
        startDate: b.startDate ? dayjs(b.startDate) : undefined,
        loiLoaDate: b.loiLoaDate ? dayjs(b.loiLoaDate) : undefined,
        agreementDate: b.agreementDate ? dayjs(b.agreementDate) : undefined,
        tenderDate: b.tenderDate ? dayjs(b.tenderDate) : undefined,
        gstEntries: b.gstEntries ?? [],
        documents: b.documents ?? [],
      });
    }).catch((err: any) => {
      message.error(err?.message || 'Failed to load site');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, isEdit, form, message]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        startDate: values.startDate?.toISOString(),
        loiLoaDate: values.loiLoaDate?.toISOString(),
        agreementDate: values.agreementDate?.toISOString(),
        tenderDate: values.tenderDate?.toISOString(),
      };
      if (isEdit && id) {
        await branchService.update(id, payload);
        message.success('Site/Plant/Project updated');
        navigate('/admin-module/master/site/list');
      } else {
        const res: any = await branchService.create(payload);
        const newSiteId = res?.data?._id || res?.data?.id || res?._id || res?.id;
        message.success('Site/Plant/Project created');
        setLocModal({ open: true, siteId: newSiteId, siteName: values.name || '' });
      }
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ─── Header Section ────────────────────────────────────────────────────────
  const headerSection = (
    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <Text type="danger" className="block text-center font-medium mb-4">{isEdit ? 'Edit Mode' : 'New Mode'}</Text>
      <FRow>
        <FItem label="Site Name" name="name" required tooltip="Full name of the site, plant, or project."><Input /></FItem>
        <FItem label="Short Name" name="code" required tooltip="A short code or abbreviation used to identify this site (e.g. HQ, SITE01)."><Input /></FItem>
      </FRow>
      <FRow>
        <Form.Item label="Is HO" name="isHO" valuePropName="checked" tooltip="Check if this is the Head Office location.">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Site Type" required>
          <div className="flex items-center gap-2">
            <Form.Item name="siteType" noStyle rules={[{ required: true, message: 'Required' }]} initialValue="site">
              <Select options={SITE_TYPE_OPTIONS} className="flex-1" />
            </Form.Item>
            <Popover content={SITE_TYPE_INFO} trigger="click" placement="rightTop">
              <Info size={16} className="cursor-pointer text-gray-500 hover:text-blue-500 shrink-0" />
            </Popover>
          </div>
        </Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Company" tooltip="Company this site belongs to (auto-filled from your account).">
          <Input value={companyName} disabled />
        </Form.Item>
        <FItem label="Division" name="division" tooltip="Business division or unit this site falls under (e.g. North Zone, Infrastructure)."><Input /></FItem>
      </FRow>
      <FRow>
        <Form.Item label="Dept. Type" name="departmentType" tooltip="Primary department type operating at this site (Civil, Electrical, etc.).">
          <Select placeholder="Please Select" options={[
            { value: 'civil', label: 'Civil' }, { value: 'electrical', label: 'Electrical' },
            { value: 'mechanical', label: 'Mechanical' }, { value: 'it', label: 'IT' },
          ]} allowClear />
        </Form.Item>
        <Form.Item label="Project Type" name="projectType" tooltip="Nature of the project at this site (Road, Bridge, Building, etc.).">
          <Select placeholder="Please Select" options={[
            { value: 'road', label: 'Road' }, { value: 'bridge', label: 'Bridge' },
            { value: 'building', label: 'Building' }, { value: 'canal', label: 'Canal' },
          ]} allowClear />
        </Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Start Date" name="startDate" tooltip="Date when operations or the project at this site officially started.">
          <DatePicker className="w-full" defaultValue={dayjs()} />
        </Form.Item>
        <Form.Item label="Purchase Limit" name="purchaseLimit" tooltip="Maximum purchase value allowed without higher approval at this site.">
          <InputNumber className="w-full" defaultValue={0} />
        </Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Is Locked" name="isLocked" valuePropName="checked" tooltip="Locking prevents any further data entry or modifications for this site.">
          <Checkbox><Text type="danger" className="text-xs">After Locking entry can not be made.</Text></Checkbox>
        </Form.Item>
        <Form.Item label="Order No." name="orderNo" tooltip="Display order for sorting this site in lists and reports.">
          <InputNumber className="w-full" defaultValue={0} />
        </Form.Item>
      </FRow>
      <FRow>
        <div />
        <Form.Item name="cgstApplicable" valuePropName="checked">
          <Checkbox>
            <Text className="text-xs">As per rules 38,42 & 43 of CGST Rules and section 17(5) — Yes</Text>
          </Checkbox>
        </Form.Item>
      </FRow>
    </div>
  );

  // ─── Tab 1: Address Details ──────────────────────────────────────────────
  const addressTab = (
    <div className="py-4">
      <FRow>
        <FItem label="Address 01" name="address01" tooltip="First line of the site's postal address (building, street)."><Input /></FItem>
        <FItem label="Address 02" name="address02" tooltip="Second line of the site's postal address (area, landmark)."><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Address 03" name="address03" tooltip="Third line of the site's postal address (city/district/state if not separate fields)."><Input /></FItem>
        <FItem label="City" name="city" required tooltip="City or town where this site is located."><Select showSearch optionFilterProp="label" placeholder="Select city" options={cityOptions} allowClear /></FItem>
      </FRow>
      <FRow>
        <FItem label="Pincode" name="pincode" tooltip="Postal/ZIP code for this site's address."><Input /></FItem>
        <FItem label="Email" name="email" tooltip="Primary email address for correspondence related to this site."><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Email Id For PO From" name="emailForPO" tooltip="Email address used specifically for sending Purchase Orders from this site."><Input /></FItem>
        <FItem label="Phone No.1" name="phone1" tooltip="Primary phone number for this site."><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Phone No.2" name="phone2" tooltip="Alternate or secondary phone number for this site."><Input /></FItem>
        <FItem label="Fax No.1" name="faxNo1" tooltip="Primary fax number for this site."><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Fax No.2" name="faxNo2" tooltip="Secondary fax number for this site."><Input /></FItem>
        <FItem label="Principal Employer" name="principalEmployer" tooltip="Name of the principal employer at this site (required for labour compliance)."><Input /></FItem>
      </FRow>
    </div>
  );

  // ─── Tab 2: Tax Details ──────────────────────────────────────────────────
  const taxTab = (
    <div className="py-4">
      <FRow>
        <Form.Item label="TIN No." name="tinNo"><Input /></Form.Item>
        <Form.Item label="STC No." name="stcNo"><Input /></Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="ECC No." name="eccNo"><Input /></Form.Item>
        <Form.Item label="Excise Range" name="exciseRange"><Input /></Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Excise Division" name="exciseDivision"><Input /></Form.Item>
        <Form.Item label="Commissionerate" name="commissionerate"><Input /></Form.Item>
      </FRow>
    </div>
  );

  // ─── Tab 3: Other Details ────────────────────────────────────────────────
  const otherTab = (
    <div className="py-4">
      <FRow>
        <FItem label="Desc. Exciseable Commodity" name="descExciseableCommodity" tooltip="Description of exciseable goods produced or handled at this site (auto-filled)."><Input disabled className="!bg-red-50" /></FItem>
        <FItem label="Contact Person" name="contactPerson" tooltip="Primary point of contact at this site for admin or HR purposes."><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Remark" name="remark" tooltip="Any additional notes or remarks about this site."><TextArea rows={2} /></FItem>
        <FItem label="Rera Reg. No." name="reraRegNo" tooltip="RERA (Real Estate Regulatory Authority) registration number, if applicable."><Input /></FItem>
      </FRow>
      <FRow>
        <Form.Item label="Completion Certificate" name="completionCertificate" tooltip="Completion certificate number issued upon project completion."><Input /></Form.Item>
        <Form.Item label="Work Capital" name="workCapital" tooltip="Working capital amount allocated for operations at this site."><InputNumber className="w-full" defaultValue={0} /></Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="LOI/LOA No." name="loiLoaNo" tooltip="Letter of Intent / Letter of Award number for this project."><Input /></Form.Item>
        <Form.Item label="LOI/LOA Date" name="loiLoaDate" tooltip="Date on which the LOI/LOA was issued."><DatePicker className="w-full" /></Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Agreement No." name="agreementNo" tooltip="Contract or agreement number signed for this project."><Input /></Form.Item>
        <Form.Item label="Agreement Date" name="agreementDate" tooltip="Date on which the project agreement/contract was signed."><DatePicker className="w-full" /></Form.Item>
      </FRow>
      <FRow>
        <Form.Item label="Mandi Licence No." name="mandiLicenceNo" tooltip="Agricultural market (Mandi) licence number, if applicable for this site."><Input /></Form.Item>
        <div />
      </FRow>
    </div>
  );

  // ─── Tab 4: GST ──────────────────────────────────────────────────────────
  const gstTab = (
    <div className="py-4">
      <Text strong className="block text-center mb-3">State Wise Tin Number (For Billing Purpose)</Text>
      <Form.List name="gstEntries">
        {(fields, { add, remove }) => (
          <>
            <div className="flex justify-end mb-2">
              <Button type="primary" size="small" danger onClick={() => add()}>Add</Button>
            </div>
            <Table dataSource={fields} pagination={false} size="small" rowKey="key" columns={[
              { title: 'State', key: 's', width: 200, render: (_, f) => <Form.Item name={[f.name, 'state']} noStyle><Input /></Form.Item> },
              { title: 'Tin Number', key: 't', width: 200, render: (_, f) => <Form.Item name={[f.name, 'tinNumber']} noStyle><Input /></Form.Item> },
              { title: 'GST Number', key: 'g', width: 200, render: (_, f) => <Form.Item name={[f.name, 'gstNumber']} noStyle><Input /></Form.Item> },
              { title: 'State Code', key: 'c', width: 100, render: (_, f) => <Form.Item name={[f.name, 'stateCode']} noStyle><Input /></Form.Item> },
              { title: 'Is UT', key: 'u', width: 60, render: (_, f) => <Form.Item name={[f.name, 'isUT']} valuePropName="checked" noStyle><Checkbox /></Form.Item> },
              { title: 'ISD', key: 'i', width: 60, render: (_, f) => <Form.Item name={[f.name, 'isISD']} valuePropName="checked" noStyle><Checkbox /></Form.Item> },
              { title: '', key: 'd', width: 50, render: (_, f) => <Button danger size="small" onClick={() => remove(f.name)}>Del</Button> },
            ]} />
          </>
        )}
      </Form.List>
    </div>
  );

  // ─── Tab 5: Document ─────────────────────────────────────────────────────
  const documentTab = (
    <div className="py-4">
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            <div className="flex justify-end mb-2">
              <Button type="primary" size="small" danger onClick={() => add()}>Add</Button>
            </div>
            <Table dataSource={fields} pagination={false} size="small" rowKey="key" columns={[
              { title: 'Document Name', key: 'n', width: 200, render: (_, f) => <Form.Item name={[f.name, 'documentName']} noStyle><Input /></Form.Item> },
              { title: 'File', key: 'f', width: 200, render: (_, f) => <Form.Item name={[f.name, 'file']} noStyle><Input placeholder="File path" /></Form.Item> },
              { title: 'File Path', key: 'p', width: 150, render: (_, f) => <Form.Item name={[f.name, 'filePath']} noStyle><Input /></Form.Item> },
              { title: 'Remark', key: 'r', width: 200, render: (_, f) => <Form.Item name={[f.name, 'remark']} noStyle><Input /></Form.Item> },
              { title: '', key: 'd', width: 50, render: (_, f) => <Button danger size="small" onClick={() => remove(f.name)}>Del</Button> },
            ]} />
          </>
        )}
      </Form.List>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Site/Plant/Project{isEdit ? ' — Edit' : ''}</Title>
        <Button icon={<ListIcon size={14} />} onClick={() => navigate('/admin-module/master/site/list')}>List</Button>
      </div>
      <Card bordered={false} className="!rounded-lg !shadow-sm" loading={loading}>
        <Form form={form} layout="vertical" size="small">
          {headerSection}
          <Tabs items={[
            { key: 'address', label: 'Address Details', children: addressTab },
            { key: 'tax', label: 'Tax Details', children: taxTab },
            { key: 'other', label: 'Other Details', children: otherTab },
            { key: 'gst', label: 'GST', children: gstTab },
            { key: 'document', label: 'Document', children: documentTab },
          ]} type="card" />
          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/site/list')}>Close</Button>
          </div>
        </Form>
      </Card>

      <Modal
        open={locModal.open}
        title={null}
        closable={false}
        maskClosable={false}
        centered
        width={480}
        footer={null}
      >
        {/* Icon header */}
        <div className="flex flex-col items-center text-center pt-4 pb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
            <MapPin size={32} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Site Created Successfully!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{locModal.siteName}</span> has been added.
          </p>
        </div>

        {/* Info box */}
        <div className="mx-2 my-4 rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20 p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <MapPin size={14} /> What is a Site Location?
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>A physical location within this site (e.g. Store, Quarry, Road point)</li>
            <li>Used for GPS-based attendance — employees check-in within the allowed buffer radius</li>
            <li>Supports route distances between locations for reporting</li>
            <li>You can add multiple locations per site anytime from the Site Location menu</li>
          </ul>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">
          Do you want to add a Site Location for <b>{locModal.siteName}</b> now?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 pb-2">
          <Button
            size="large"
            type="primary"
            danger
            icon={<MapPin size={15} />}
            onClick={() => { setLocModal({ open: false, siteId: '', siteName: '' }); navigate(`/admin-module/master/site-location/add?site=${locModal.siteId}`); }}
          >
            Add Site Location
          </Button>
        </div>
      </Modal>
    </div>
  );
}

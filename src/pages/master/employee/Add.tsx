import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Select, DatePicker, Checkbox, Button, Space, Typography,
  Tabs, App, Radio, Table, Popconfirm, Upload,
} from 'antd';
import { List as ListIcon, Plus as PlusIcon, Trash2, Upload as UploadIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { refId, toDayjs, mapList } from '@/lib/formValues';
import employeeService from '@/services/employeeService';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useEmployeeGroupList } from '@/hooks/queries/useEmployeeGroups';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import {
  levelHooks, gradeHooks, tagHooks, cityHooks, bankHooks,
} from '@/hooks/queries/useMasterOther';
import {
  TITLE_OPTIONS, BLOOD_GROUP_OPTIONS, RELIGION_OPTIONS, LOCAL_MIGRANT_OPTIONS,
  CATEGORY_SKILL_OPTIONS, SUB_COMPANY_OPTIONS, PF_SCHEME_OPTIONS, EMP_STATUS_OPTIONS,
  TDS_REGIME_OPTIONS, RELATION_OPTIONS, DIVISION_OPTIONS, ROLE_TYPE_OPTIONS,
} from '@/types/enums';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper to convert DatePicker dayjs values into ISO strings before submission.
const toIso = (v: any) => (v && dayjs.isDayjs(v) ? v.toISOString() : v);

const EmployeeAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('personal');
  const [submitting, setSubmitting] = useState(false);
  const [saveAndNext, setSaveAndNext] = useState(false);

  // Master data
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: branches } = useBranchList();
  const { data: empGroups } = useEmployeeGroupList();
  const { data: myCompany } = useMyCompany();
  const { data: levels } = levelHooks.useList();
  const { data: grades } = gradeHooks.useList();
  const { data: tags } = tagHooks.useList();
  const { data: cities } = cityHooks.useList();
  const { data: banks } = bankHooks.useList();

  // Auto-set company from current user's company
  const companyOptions = useMemo(() => {
    const c = myCompany?.data;
    return c ? [{ value: c._id || c.id, label: c.name }] : [];
  }, [myCompany]);

  useEffect(() => {
    if (!isEdit && myCompany?.data) {
      const c = myCompany.data;
      form.setFieldValue('company', c._id || c.id);
    }
  }, [myCompany, isEdit, form]);

  // Top-level scalar dates that need to be re-hydrated to dayjs for DatePicker.
  const SCALAR_DATE_FIELDS = [
    'dateOfBirth', 'anniversary', 'joinDate', 'joiningDateCompanyGrp', 'interviewDate',
    'firstVaccinationDate', 'secondVaccinationDate', 'passportIssueDate',
    'passportExpiryDate', 'visaExpiryDate', 'pfDate', 'pfExitDate', 'esicDate',
    'bondExpiryDate', 'appointmentIssueDate', 'receiveDate', 'validTill',
  ] as const;

  // Ref fields the backend populates as {_id, name}. Selects bind to plain IDs,
  // so flatten each one to a string before setFieldsValue.
  const REF_FIELDS = [
    'company', 'branch', 'department', 'designation', 'level', 'grade',
    'employeeGroup', 'shift', 'city', 'permanentCity', 'tagName', 'employerBankName',
    'reportingManager',
  ] as const;

  // Load existing if editing
  useEffect(() => {
    if (!isEdit || !id) return;
    employeeService.getById(id).then((res: any) => {
      const e = res?.data;
      if (!e) return;

      const patch: Record<string, unknown> = { ...e };
      for (const f of SCALAR_DATE_FIELDS) patch[f] = toDayjs(e[f]);
      for (const f of REF_FIELDS) patch[f] = refId(e[f]);
      // Form.List rows that contain DatePicker fields — re-hydrate per row.
      patch.relatives = mapList(e.relatives, (r: any) => ({ ...r, dob: toDayjs(r.dob) }));
      patch.previousOrgs = mapList(e.previousOrgs, (r: any) => ({
        ...r, from: toDayjs(r.from), to: toDayjs(r.to),
      }));

      form.setFieldsValue(patch);
    }).catch(() => { /* ignore */ });
  }, [isEdit, id, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Normalise all date fields.
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(values)) {
        payload[k] = toIso(v);
      }
      if (isEdit && id) {
        await employeeService.update(id, payload);
        message.success('Record Saved successfully');
      } else {
        const res: any = await employeeService.create(payload);
        const emp = res?.data ?? res;
        const empCode = emp?.employeeId || emp?.customEmployeeCode || '-';
        const workId = emp?.workId || emp?.employeeCode || '-';
        message.success(`Record Saved successfully - Allotted Emp Code ${empCode} and Work ID ${workId}`, 6);
      }
      if (saveAndNext) navigate('/master/salary-structure/assign');
      else navigate('/master/employee/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  const opts = (list: any[], labelField = 'name') =>
    (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x[labelField] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Employee' : 'Employee'}</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/employee/list')}>List</Button>
      </div>

      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSubmit}
        initialValues={{
          title: 'Mr.', specialEmployee: false, gender: 'male', maritalStatus: 'single',
          heightFeet: 0, heightInches: 0, weightKg: 0, religionEnum: 'na',
          isPhysicallyChallenged: false, isInternationalEmployee: false,
          eligibleForExcessEPF: false, eligibleForExcessEPS: false,
          vocationalTrainingCentre: false, independentMedicalExamination: false,
          tdsRegimeType: 'new', totalWorkingPerDay: 0, noticePeriodDays: 0,
          previousExperienceYear: 0, previousExperienceMonth: 0, fuelRate: 0,
          confirmationDay: 0, panAadhaarLinkingDec: false,
        }}
      >
        {/* ─── TOP PANEL ──────────────────────────────────────────────────── */}
        <Card bordered={false} className="mb-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item label="Employee Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} required>
              <Space.Compact className="w-full">
                <Form.Item name="title" noStyle><Select options={TITLE_OPTIONS} style={{ width: 80 }} /></Form.Item>
                <Form.Item name="firstName" noStyle rules={[{ required: true, message: 'Name required' }]}><Input placeholder="First Name" /></Form.Item>
                <Form.Item name="lastName" noStyle><Input placeholder="Last Name" /></Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="Joining Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Space.Compact className="w-full">
                <Form.Item name="joinDate" noStyle rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                <Form.Item name="fileNo" noStyle><Input placeholder="File no" style={{ width: 150 }} /></Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item name="company" label="Company Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={companyOptions} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="branch" label="Branch Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={opts(branches?.data ?? [])} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item name="level" label="Level Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select placeholder="Please Select" options={opts(levels?.data ?? [])} allowClear />
            </Form.Item>
            <Form.Item name="grade" label="Grade Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select placeholder="Please Select" options={opts(grades?.data ?? [])} allowClear />
            </Form.Item>

            <Form.Item name="department" label="Department" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={opts(depts?.data ?? [])} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="designation" label="Designation" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={opts(desigs?.data ?? [])} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item name="shift" label="Shift" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select placeholder="Please Select" allowClear options={[]} />
            </Form.Item>
            <Form.Item name="employeeGroup" label="Employee Group" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={opts(empGroups?.data ?? [])} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item label="Is Active" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Form.Item name="isActive" valuePropName="checked" noStyle initialValue><Checkbox>Yes</Checkbox></Form.Item>
            </Form.Item>
            <Form.Item label="Special Employee" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Form.Item name="specialEmployee" valuePropName="checked" noStyle><Checkbox>Yes</Checkbox></Form.Item>
            </Form.Item>
          </div>
        </Card>

        {/* ─── TABS ──────────────────────────────────────────────────────── */}
        <Card bordered={false}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            {
              key: 'personal',
              label: 'Personal Detail',
              children: (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
                  <Form.Item name="fatherName" label="Father/Husband Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="motherName" label="Mother Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="spouseName" label="Spouse Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="dateOfBirth" label="Date Of Birth" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="gender" label="Gender" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Select options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                  </Form.Item>
                  <Form.Item label="Status / Anniversary" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Space.Compact className="w-full">
                      <Form.Item name="maritalStatus" noStyle>
                        <Select options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]} />
                      </Form.Item>
                      <Form.Item name="anniversary" noStyle><DatePicker format="DD/MM/YYYY" /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                  <Form.Item name="bloodGroup" label="Blood Group" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Select allowClear placeholder="Please Select" options={BLOOD_GROUP_OPTIONS} />
                  </Form.Item>
                  <Form.Item name="mobileNo" label="Mobile No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="alternateMobileNo" label="Alternate Mobile No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="email" label="Email ID" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input type="email" /></Form.Item>
                  <Form.Item name="alternateEmail" label="Alternate Email ID" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input type="email" /></Form.Item>
                  <Form.Item name={['currentAddress', 'street']} label="Present Address" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
                  <Form.Item name={['permanentAddress', 'street']} label="Permanent Address" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><TextArea rows={2} /></Form.Item>
                  <Form.Item name="city" label="City" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please Select" options={opts(cities?.data ?? [])} showSearch optionFilterProp="label" /></Form.Item>
                  <Form.Item name="permanentCity" label="City (Permanent)" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please Select" options={opts(cities?.data ?? [])} showSearch optionFilterProp="label" /></Form.Item>
                  <Form.Item label="Employee Height / Weight" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Space.Compact className="w-full">
                      <Form.Item name="heightFeet" noStyle><InputNumber min={0} placeholder="ft" /></Form.Item>
                      <Form.Item name="heightInches" noStyle><InputNumber min={0} max={11} placeholder="inch" /></Form.Item>
                      <Form.Item name="weightKg" noStyle><InputNumber min={0} placeholder="kg" /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                  <Form.Item label="Religion / Nationality" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Space.Compact className="w-full">
                      <Form.Item name="religionEnum" noStyle><Select options={RELIGION_OPTIONS} /></Form.Item>
                      <Form.Item name="nationality" noStyle><Input placeholder="Nationality" /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                  <Form.Item name="firstVaccinationDate" label="First Vaccination Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="secondVaccinationDate" label="Second Vaccination Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="localMigrant" label="Local Migrant" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please select" options={LOCAL_MIGRANT_OPTIONS} /></Form.Item>
                  <Form.Item name="categorySkill" label="Category Skill" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please select" options={CATEGORY_SKILL_OPTIONS} /></Form.Item>
                  <Form.Item name="subCompany" label="Sub Company" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please select" options={SUB_COMPANY_OPTIONS} /></Form.Item>
                  <Form.Item name="pfScheme" label="PF Scheme" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please select" options={PF_SCHEME_OPTIONS} /></Form.Item>
                  <Form.Item name="empStatus" label="Emp Status" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select allowClear placeholder="Please select" options={EMP_STATUS_OPTIONS} /></Form.Item>
                  <Form.Item name="isPhysicallyChallenged" label="Is Physical Challenged" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                  <Form.Item name="isInternationalEmployee" label="Is International Employee" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                  <Form.Item name="eligibleForExcessEPF" label="Eligible for excess EPF" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                  <Form.Item name="eligibleForExcessEPS" label="Eligible for excess EPS" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                  <Form.Item name="vocationalTrainingCentre" label="Vocational Training Centre (VTC)" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                  <Form.Item name="independentMedicalExamination" label="Independent Medical examination" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Radio.Group><Radio value={false}>NO</Radio><Radio value={true}>YES</Radio></Radio.Group></Form.Item>
                </div>
              ),
            },
            {
              key: 'hr',
              label: 'HR Detail',
              children: (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
                  <Form.Item name="joiningDateCompanyGrp" label="Joining Date of Company Grp" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="interviewDate" label="Interview Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="confirmationDay" label="Confirmation Day" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><InputNumber min={0} className="w-full" /></Form.Item>
                  <Form.Item name="tagName" label="Tag Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select placeholder="Please Select" allowClear options={opts(tags?.data ?? [])} /></Form.Item>
                  <Form.Item name="validTill" label="Valid Till" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="drivingLicenseNo" label="Driving License No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="licenseCategory" label="License Category" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="licenseIssueBy" label="License Issue By" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="passportNo" label="Passport No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="issueCountry" label="Issue Country" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="passportIssueDate" label="Issue Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="passportExpiryDate" label="Expiry Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="visaType" label="Visa Type" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="visaExpiryDate" label="Visa Expiry Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="voterId" label="Voter ID" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item label="Previous Experience" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Space.Compact>
                      <Form.Item name="previousExperienceYear" noStyle><InputNumber min={0} addonAfter="Year" /></Form.Item>
                      <Form.Item name="previousExperienceMonth" noStyle><InputNumber min={0} max={11} addonAfter="Month" /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                  <Form.Item name="pfNumber" label="PF Number" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="pfDate" label="PF Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="pfExitDate" label="PF Exit Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="universalAccNo" label="Uni. Acc. No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="aadhaarCardName" label="Aadhaar Card Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name={['identityDocs', 'aadhaarNumber']} label="Aadhaar No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input maxLength={12} /></Form.Item>
                  <Form.Item name="virtualId" label="Virtual ID" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name={['identityDocs', 'panNumber']} label="PAN No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input maxLength={10} /></Form.Item>
                  <Form.Item name="panCardName" label="PAN Card Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="esicNo" label="ESIC No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="esicDate" label="ESIC Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="panAadhaarLinkingDec" label="PAN Aadhaar Linking Dec." valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Checkbox /></Form.Item>
                  <Form.Item name="empRemark" label="Emp Remark" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item label="Total working / Notice Period" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Space.Compact>
                      <Form.Item name="totalWorkingPerDay" noStyle><InputNumber min={0} addonAfter="hr" /></Form.Item>
                      <Form.Item name="noticePeriodDays" noStyle><InputNumber min={0} addonAfter="Days" /></Form.Item>
                    </Space.Compact>
                  </Form.Item>
                  <Form.Item name="tdsRegimeType" label="TDS Regime Type" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Select options={TDS_REGIME_OPTIONS} /></Form.Item>
                  <Form.Item name="lwf" label="LWF" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="serviceBookNo" label="Service Book No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="fuelRate" label="Fuel Rate" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><InputNumber min={0} className="w-full" /></Form.Item>
                  <Form.Item name="markOfIdentification" label="Mark of Identification" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="bondExpiryDate" label="Bond Expiry Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="educationLevel" label="Education Level" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="referredBy" label="Referred By" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="referredContactNo" label="Referred Contact No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="appointmentIssueDate" label="Appointment Issue Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="receiveDate" label="Receive Date" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item>
                  <Form.Item name="pranNps" label="PRAN (NPS)" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="citizenNo" label="Citizen No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="currency" label="Currency" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="employeeBankName" label="Employee Bank Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="employeeBankAccNo" label="Employee Bank Acc No." labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="ifscCode" label="IFSC Code" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="bankAccountHolderName" label="Bank Account Holder Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="employeeBankBranch" label="Employee Bank Branch" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                  <Form.Item name="employerBankName" label="Employer Bank Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Select allowClear placeholder="Please Select" options={opts(banks?.data ?? [])} />
                  </Form.Item>
                  <Form.Item name="customEmployeeCode" label="Custom Employee Code" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}><Input /></Form.Item>
                </div>
              ),
            },
            // For brevity, the remaining tabs use Form.List patterns and
            // placeholder content. Full detail can be expanded per business need.
            {
              key: 'docs',
              label: 'Document & Photo',
              children: (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-x-8">
                  <Form.Item name="photoUrl" label="Employee Photo" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                    <Input placeholder="Upload URL (wire /upload to persist)" />
                  </Form.Item>
                  <Form.Item name="signatureUrl" label="Employee Signature" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                    <Input placeholder="Upload URL" />
                  </Form.Item>
                  <div className="col-span-full"><Text type="secondary">Add documents using Form.List; see backend `additionalDocs` array.</Text></div>
                </div>
              ),
            },
            {
              key: 'branch',
              label: 'Branch Detail',
              children: <Text type="secondary">Branch history table (auto-tracked by the system on transfers).</Text>,
            },
            {
              key: 'salary',
              label: 'Salary Structure',
              children: <Text type="secondary">Assign via Master → Salary Structure → Assign Salary Head.</Text>,
            },
            {
              key: 'relatives',
              label: 'Relative Detail',
              children: (
                <Form.List name="relatives">
                  {(fields, { add, remove }) => (
                    <div>
                      <Table
                        size="small" bordered pagination={false}
                        dataSource={fields as any} rowKey="key"
                        columns={[
                          { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                          { title: 'Relation', render: (_: any, f: any) => <Form.Item name={[f.name, 'relation']} noStyle><Select options={RELATION_OPTIONS} style={{ width: 130 }} /></Form.Item> },
                          { title: 'Relative Name', render: (_: any, f: any) => <Form.Item name={[f.name, 'relativeName']} noStyle><Input /></Form.Item> },
                          { title: 'Is Nominee', render: (_: any, f: any) => <Form.Item name={[f.name, 'isNominee']} valuePropName="checked" noStyle><Checkbox /></Form.Item> },
                          { title: 'Contact No.', render: (_: any, f: any) => <Form.Item name={[f.name, 'contactNo']} noStyle><Input /></Form.Item> },
                          { title: 'Is Emergency', render: (_: any, f: any) => <Form.Item name={[f.name, 'isEmergency']} valuePropName="checked" noStyle><Checkbox /></Form.Item> },
                          { title: 'Aadhaar No.', render: (_: any, f: any) => <Form.Item name={[f.name, 'aadhaarNo']} noStyle><Input /></Form.Item> },
                          { title: 'DOB', render: (_: any, f: any) => <Form.Item name={[f.name, 'dob']} noStyle><DatePicker format="DD/MM/YYYY" /></Form.Item> },
                          { title: 'Blood Group', render: (_: any, f: any) => <Form.Item name={[f.name, 'bloodGroup']} noStyle><Select allowClear options={BLOOD_GROUP_OPTIONS} style={{ width: 90 }} /></Form.Item> },
                          { title: '', width: 60, render: (_: any, f: any) => <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => remove(f.name)} /> },
                        ]}
                      />
                      <Button className="mt-2" icon={<PlusIcon size={14} />} onClick={() => add({ relation: 'mother', isNominee: false, isEmergency: false })}>Add Relative</Button>
                    </div>
                  )}
                </Form.List>
              ),
            },
            {
              key: 'resignation',
              label: 'Resignation Detail',
              children: <Text type="secondary">Managed from Master → Employee → Resignation.</Text>,
            },
            {
              key: 'certificate',
              label: 'Certificate',
              children: <Text type="secondary">Reserved for certificates issued to the employee.</Text>,
            },
            {
              key: 'education',
              label: 'Education Detail',
              children: (
                <Form.List name="education">
                  {(fields, { add, remove }) => (
                    <div>
                      <Table size="small" bordered pagination={false} dataSource={fields as any} rowKey="key" columns={[
                        { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                        { title: 'Degree', render: (_: any, f: any) => <Form.Item name={[f.name, 'degreeOfExam']} noStyle><Input /></Form.Item> },
                        { title: 'University/College', render: (_: any, f: any) => <Form.Item name={[f.name, 'universityCollegeSchool']} noStyle><Input /></Form.Item> },
                        { title: 'Division', render: (_: any, f: any) => <Form.Item name={[f.name, 'division']} noStyle><Select allowClear options={DIVISION_OPTIONS} style={{ width: 110 }} /></Form.Item> },
                        { title: '% Marks', render: (_: any, f: any) => <Form.Item name={[f.name, 'percentageOfMarks']} noStyle><InputNumber min={0} max={100} /></Form.Item> },
                        { title: 'Passing Year', render: (_: any, f: any) => <Form.Item name={[f.name, 'passingYear']} noStyle><Input /></Form.Item> },
                        { title: 'Principal Subject', render: (_: any, f: any) => <Form.Item name={[f.name, 'principalSubject']} noStyle><Input /></Form.Item> },
                        { title: 'Remark', render: (_: any, f: any) => <Form.Item name={[f.name, 'remark']} noStyle><Input /></Form.Item> },
                        { title: '', width: 60, render: (_: any, f: any) => <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => remove(f.name)} /> },
                      ]} />
                      <Button className="mt-2" icon={<PlusIcon size={14} />} onClick={() => add({})}>Add Education</Button>
                    </div>
                  )}
                </Form.List>
              ),
            },
            {
              key: 'empRoles',
              label: 'Emp Roles',
              children: (
                <Form.List name="empRoles">
                  {(fields, { add, remove }) => (
                    <div>
                      <Table size="small" bordered pagination={false} dataSource={fields as any} rowKey="key" columns={[
                        { title: 'Role Type', render: (_: any, f: any) => <Form.Item name={[f.name, 'roleType']} noStyle><Select options={ROLE_TYPE_OPTIONS} style={{ width: 200 }} /></Form.Item> },
                        { title: 'Description', render: (_: any, f: any) => <Form.Item name={[f.name, 'description']} noStyle><Input /></Form.Item> },
                        { title: '', width: 60, render: (_: any, f: any) => <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => remove(f.name)} /> },
                      ]} />
                      <Button className="mt-2" icon={<PlusIcon size={14} />} onClick={() => add({ roleType: 'fixed_working' })}>Add Role</Button>
                    </div>
                  )}
                </Form.List>
              ),
            },
            {
              key: 'prevOrgs',
              label: 'Previous Organization Detail',
              children: (
                <Form.List name="previousOrgs">
                  {(fields, { add, remove }) => (
                    <div>
                      <Table size="small" bordered pagination={false} dataSource={fields as any} rowKey="key" columns={[
                        { title: 'S.N.', width: 60, render: (_: any, __: any, i: number) => i + 1 },
                        { title: 'Name', render: (_: any, f: any) => <Form.Item name={[f.name, 'name']} noStyle><Input /></Form.Item> },
                        { title: 'From', render: (_: any, f: any) => <Form.Item name={[f.name, 'from']} noStyle><DatePicker format="DD/MM/YYYY" /></Form.Item> },
                        { title: 'To', render: (_: any, f: any) => <Form.Item name={[f.name, 'to']} noStyle><DatePicker format="DD/MM/YYYY" /></Form.Item> },
                        { title: 'Designation', render: (_: any, f: any) => <Form.Item name={[f.name, 'designation']} noStyle><Input /></Form.Item> },
                        { title: 'Last Salary', render: (_: any, f: any) => <Form.Item name={[f.name, 'lastSalaryDrawn']} noStyle><InputNumber min={0} /></Form.Item> },
                        { title: 'Reason For Leaving', render: (_: any, f: any) => <Form.Item name={[f.name, 'reasonForLeaving']} noStyle><Input /></Form.Item> },
                        { title: '', width: 60, render: (_: any, f: any) => <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => remove(f.name)} /> },
                      ]} />
                      <Button className="mt-2" icon={<PlusIcon size={14} />} onClick={() => add({})}>Add Previous Org</Button>
                    </div>
                  )}
                </Form.List>
              ),
            },
          ]} />
        </Card>

        <div className="flex items-center justify-center gap-4 mt-4">
          <Checkbox checked={saveAndNext} onChange={(e) => setSaveAndNext(e.target.checked)}>
            Save & Next to Salary Structure
          </Checkbox>
        </div>
        <div className="flex justify-center mt-2 mb-6">
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
            <Button onClick={() => navigate('/master/employee/list')}>Close</Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default EmployeeAdd;

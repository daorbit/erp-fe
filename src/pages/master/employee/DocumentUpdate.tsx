import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Select, Button, Space, Typography, App, Table, Input, Empty, Spin,
} from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import { useBranchList } from '@/hooks/queries/useBranches';
import employeeService from '@/services/employeeService';
import { documentMasterHooks } from '@/hooks/queries/useMasterOther';

const { Title } = Typography;

// Employee Document Update — pick an employee, see their additionalDocs array,
// add/remove document-type entries (file upload URL for now).
const DocumentUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [company, setCompany] = useState<string | undefined>();
  const [branch, setBranch] = useState<string | undefined>();
  const [employee, setEmployee] = useState<string | undefined>();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounced employee search
  const [empOptions, setEmpOptions] = useState<{ value: string; label: string }[]>([]);
  const [empSearching, setEmpSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEmpSearch = useCallback((searchText: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchText || searchText.length < 1) {
      setEmpOptions([]);
      return;
    }
    setEmpSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await employeeService.getAll({ search: searchText, limit: '20' });
        const list = res?.data ?? [];
        setEmpOptions(
          list.map((e: any) => {
            const user = e.userId ?? e;
            const first = user.firstName ?? e.firstName ?? '';
            const last = user.lastName ?? e.lastName ?? '';
            return {
              value: e._id || e.id,
              label: `${first} ${last} (${e.employeeId ?? ''})`.trim(),
            };
          }),
        );
      } catch {
        setEmpOptions([]);
      } finally {
        setEmpSearching(false);
      }
    }, 400);
  }, []);

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
  const { data: docTypes } = documentMasterHooks.useList();

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));

  const handleShow = async () => {
    if (!employee) { message.error('Pick an employee'); return; }
    setLoading(true);
    try {
      const res: any = await employeeService.getById(employee);
      setDocs(res?.data?.additionalDocs ?? []);
    } catch (err: any) {
      message.error(err?.message || 'Failed to load documents');
    } finally { setLoading(false); }
  };

  const handleAdd = () => setDocs((prev) => [...prev, { documentType: undefined, remarks: '', fileUrl: '' }]);
  const handleChange = (i: number, field: string, value: any) =>
    setDocs((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const handleRemove = (i: number) => setDocs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!employee) return;
    setSaving(true);
    try {
      await employeeService.update(employee, { additionalDocs: docs });
      message.success('Documents updated');
    } catch (err: any) {
      message.error(err?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Employee Document Update</Title>
        <Button type="link" onClick={() => navigate('/master/employee/list')}>List</Button>
      </div>

      <Card bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs mb-1">Company Name</div>
            <Select allowClear placeholder="ALL" value={company} onChange={setCompany}
              options={companyOptions} className="w-full" />
          </div>
          <div>
            <div className="text-xs mb-1">Branch Name</div>
            <Select allowClear placeholder="ALL" value={branch} onChange={setBranch}
              options={opts(branches?.data ?? [])} className="w-full" />
          </div>
          <div>
            <div className="text-xs mb-1">Employee Name *</div>
            <Select
              placeholder="Type atleast 1 character"
              showSearch={{ onSearch: handleEmpSearch, filterOption: false }}
              value={employee}
              onChange={setEmployee}
              options={empOptions}
              notFoundContent={empSearching ? <Spin size="small" /> : null}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Space>
            <Button type="primary" onClick={handleShow} loading={loading}>Show</Button>
            <Button onClick={() => { setEmployee(undefined); setDocs([]); }}>Close</Button>
          </Space>
        </div>
      </Card>

      {employee && (
        <Card bordered={false}>
          {docs.length === 0 ? <Empty description="No documents — click Add to create." /> : null}
          <Table
            columns={[
              { title: 'S.N.', render: (_: any, __: any, i: number) => i + 1, width: 60 },
              {
                title: 'Document Type', render: (_: any, _r: any, i: number) => (
                  <Select allowClear placeholder="Select type"
                    value={docs[i]?.documentType} onChange={(v) => handleChange(i, 'documentType', v)}
                    options={opts(docTypes?.data ?? [])} style={{ width: 260 }} />
                ),
              },
              {
                title: 'Remarks', render: (_: any, _r: any, i: number) => (
                  <Input value={docs[i]?.remarks} onChange={(e) => handleChange(i, 'remarks', e.target.value)} />
                ),
              },
              {
                title: 'File URL', render: (_: any, _r: any, i: number) => (
                  <Input value={docs[i]?.fileUrl} onChange={(e) => handleChange(i, 'fileUrl', e.target.value)}
                    placeholder="upload URL (wire /upload later)" />
                ),
              },
              {
                title: '', width: 60,
                render: (_: any, __: any, i: number) => (
                  <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => handleRemove(i)} />
                ),
              },
            ]}
            dataSource={docs}
            rowKey={(_: any, i: any) => String(i)}
            pagination={false}
            size="small" bordered
          />
          <div className="flex justify-between mt-3">
            <Button onClick={handleAdd}>+ Add Document</Button>
            <Space>
              <Button type="primary" onClick={handleSave} loading={saving}>Save</Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpdate;

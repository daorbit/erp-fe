import React from 'react';
import { Form, Input, Checkbox, Upload, Button, App } from 'antd';
import { Upload as UploadIcon } from 'lucide-react';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { importantFormHooks } from '@/hooks/queries/useMasterOther';
import type { UploadFile } from 'antd/es/upload/interface';

const ImportantFormPage: React.FC = () => {
  const { data, isLoading } = importantFormHooks.useList();
  const create = importantFormHooks.useCreate();
  const update = importantFormHooks.useUpdate();
  const del = importantFormHooks.useDelete();
  const { message } = App.useApp();

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _empShow: r.showInEmpSection ? 'YES' : 'NO',
  }));

  return (
    <CombinedMasterPage
      title="Important Form"
      rows={rows}
      isLoading={isLoading}
      initialValues={{ showInEmpSection: false }}
      columns={[
        { title: 'Document Name', dataIndex: 'name' },
        { title: 'File Name', dataIndex: 'fileName' },
        { title: 'Emp Show', dataIndex: '_empShow', width: 100 },
      ]}
      toFormValues={(r) => ({
        name: r.name,
        showInEmpSection: !!r.showInEmpSection,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
      })}
      renderForm={(form) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <Form.Item
            name="name"
            label="Document Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Document Name is required' }]}
          >
            <Input maxLength={150} autoFocus />
          </Form.Item>
          <Form.Item label="Upload" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Upload
              beforeUpload={(file: File) => {
                // Upload handling: since the project uses an /upload endpoint elsewhere,
                // hook that in when ready. For now, accept the file locally and store
                // just the filename for display.
                form.setFieldValue('fileName', file.name);
                message.info(`Selected ${file.name} — wire in /upload to persist.`);
                return false; // prevent auto-upload
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadIcon size={14} />}>Choose file</Button>
            </Upload>
            <Form.Item name="fileName" noStyle>
              <Input readOnly style={{ marginTop: 6 }} placeholder="No file chosen" />
            </Form.Item>
            <Form.Item name="fileUrl" hidden><Input /></Form.Item>
          </Form.Item>
          <Form.Item
            name="showInEmpSection"
            label="Show in Emp Section"
            valuePropName="checked"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
          >
            <Checkbox />
          </Form.Item>
        </div>
      )}
      onSubmit={async (values, editing) => {
        if (editing) await update.mutateAsync({ id: editing._id || editing.id, data: values });
        else await create.mutateAsync(values);
      }}
      onDelete={async (id) => { await del.mutateAsync(id); }}
      layout="stacked"
    />
  );
};

export default ImportantFormPage;

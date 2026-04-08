/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Modal, Form,
  Select, Row, Col, Tabs, Upload, Checkbox, DatePicker, Tooltip, Dropdown,
} from 'antd';
import {
  Plus, Search, Download, Eye, Trash2, MoreHorizontal, FileText, File,
  FileSpreadsheet, FileImage, Grid3X3, List, SlidersHorizontal, Upload as UploadIcon,
} from 'lucide-react';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface DocumentItem {
  key: string;
  title: string;
  description: string;
  category: string;
  employee: string | null;
  uploadedBy: string;
  date: string;
  fileType: string;
  fileSize: string;
  expiryDate: string | null;
  isPublic: boolean;
  tags: string[];
}

const documents: DocumentItem[] = [
  { key: '1', title: 'Employee Handbook 2026', description: 'Company-wide employee handbook', category: 'Policy', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-01-10', fileType: 'PDF', fileSize: '2.4 MB', expiryDate: null, isPublic: true, tags: ['handbook', 'policy'] },
  { key: '2', title: 'Leave Policy', description: 'Updated leave and attendance policy', category: 'Policy', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-01-15', fileType: 'PDF', fileSize: '1.1 MB', expiryDate: null, isPublic: true, tags: ['leave', 'attendance'] },
  { key: '3', title: 'NDA Template', description: 'Non-disclosure agreement template', category: 'Template', employee: null, uploadedBy: 'Ananya Reddy', date: '2026-02-01', fileType: 'DOCX', fileSize: '245 KB', expiryDate: null, isPublic: true, tags: ['nda', 'legal'] },
  { key: '4', title: 'Offer Letter - Rahul Sharma', description: 'Offer letter for Software Engineer position', category: 'Letter', employee: 'Rahul Sharma', uploadedBy: 'Priya Singh', date: '2025-12-20', fileType: 'PDF', fileSize: '380 KB', expiryDate: null, isPublic: false, tags: ['offer', 'hiring'] },
  { key: '5', title: 'Aadhaar Card - Amit Patel', description: 'Identity proof document', category: 'Certificate', employee: 'Amit Patel', uploadedBy: 'Amit Patel', date: '2026-03-05', fileType: 'PDF', fileSize: '1.8 MB', expiryDate: '2030-06-15', isPublic: false, tags: ['id-proof', 'aadhaar'] },
  { key: '6', title: 'PAN Card - Vikram Joshi', description: 'Tax identification document', category: 'Certificate', employee: 'Vikram Joshi', uploadedBy: 'Vikram Joshi', date: '2026-03-10', fileType: 'JPG', fileSize: '520 KB', expiryDate: null, isPublic: false, tags: ['id-proof', 'pan'] },
  { key: '7', title: 'Travel Reimbursement Form', description: 'Standard travel expense claim template', category: 'Template', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-02-18', fileType: 'XLSX', fileSize: '78 KB', expiryDate: null, isPublic: true, tags: ['expense', 'travel'] },
  { key: '8', title: 'Remote Work Policy', description: 'Work from home guidelines and eligibility', category: 'Policy', employee: null, uploadedBy: 'Priya Singh', date: '2026-03-20', fileType: 'PDF', fileSize: '890 KB', expiryDate: null, isPublic: true, tags: ['wfh', 'remote'] },
  { key: '9', title: 'Experience Certificate - Sneha Gupta', description: 'Employment experience certificate', category: 'Certificate', employee: 'Sneha Gupta', uploadedBy: 'Ananya Reddy', date: '2026-01-30', fileType: 'PDF', fileSize: '210 KB', expiryDate: null, isPublic: false, tags: ['certificate', 'experience'] },
  { key: '10', title: 'IT Security Guidelines', description: 'Information security policy for all employees', category: 'Policy', employee: null, uploadedBy: 'Vikram Joshi', date: '2026-02-25', fileType: 'PDF', fileSize: '1.5 MB', expiryDate: null, isPublic: true, tags: ['security', 'it'] },
];

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'PDF': return <FileText size={16} style={{ color: '#dc2626' }} />;
    case 'DOCX': return <File size={16} style={{ color: '#2563eb' }} />;
    case 'XLSX': return <FileSpreadsheet size={16} style={{ color: '#059669' }} />;
    case 'JPG':
    case 'PNG': return <FileImage size={16} style={{ color: '#d97706' }} />;
    default: return <File size={16} style={{ color: '#6b7280' }} />;
  }
};

const categoryColors: Record<string, string> = {
  Policy: 'blue',
  Template: 'purple',
  Letter: 'cyan',
  Certificate: 'green',
  Form: 'orange',
};

const DocumentList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [form] = Form.useForm();

  const getFilteredDocs = () => {
    let filtered = documents;
    if (activeTab === 'policies') filtered = filtered.filter(d => d.category === 'Policy');
    if (activeTab === 'my') filtered = filtered.filter(d => d.employee !== null);
    if (categoryFilter) filtered = filtered.filter(d => d.category === categoryFilter);
    if (searchText) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(searchText.toLowerCase()) ||
        d.category.toLowerCase().includes(searchText.toLowerCase()) ||
        (d.employee && d.employee.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    return filtered;
  };

  const filteredDocs = getFilteredDocs();

  const columns = [
    {
      title: 'Document', dataIndex: 'title', key: 'title',
      render: (text: string, record: DocumentItem) => (
        <Space>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {getFileIcon(record.fileType)}
          </div>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>,
    },
    {
      title: 'Employee', dataIndex: 'employee', key: 'employee',
      render: (emp: string | null) => emp ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{emp[0]}</Avatar>
          <Text>{emp}</Text>
        </Space>
      ) : <Text type="secondary">--</Text>,
    },
    { title: 'Uploaded By', dataIndex: 'uploadedBy', key: 'uploadedBy' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Type', dataIndex: 'fileType', key: 'fileType',
      render: (type: string) => (
        <Space size={4}>
          {getFileIcon(type)}
          <Text type="secondary">{type}</Text>
        </Space>
      ),
    },
    { title: 'Size', dataIndex: 'fileSize', key: 'fileSize', render: (s: string) => <Text type="secondary">{s}</Text> },
    {
      title: 'Expiry', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (date: string | null) => date ? <Text>{date}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Actions', key: 'actions',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={16} />, label: 'View' },
          { key: 'download', icon: <Download size={16} />, label: 'Download' },
          { key: 'delete', icon: <Trash2 size={16} />, label: 'Delete', danger: true },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredDocs.map(doc => (
        <Col xs={24} sm={12} lg={6} key={doc.key}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            hoverable
            actions={[
              <Tooltip title="View" key="view"><Eye size={16} /></Tooltip>,
              <Tooltip title="Download" key="download"><Download size={16} /></Tooltip>,
              <Tooltip title="Delete" key="delete"><Trash2 size={16} /></Tooltip>,
            ]}
          >
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                {React.cloneElement(getFileIcon(doc.fileType), { size: 28 })}
              </div>
              <Text strong style={{ display: 'block' }}>{doc.title}</Text>
              <Tag color={categoryColors[doc.category] || 'default'} style={{ marginTop: 4 }}>{doc.category}</Tag>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Size</Text>
                <Text>{doc.fileSize}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Uploaded</Text>
                <Text>{doc.date}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">By</Text>
                <Text>{doc.uploadedBy}</Text>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Document Management</Title>
          <Text type="secondary">Manage company and employee documents securely</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: 'All Documents' },
            { key: 'policies', label: 'Company Policies' },
            { key: 'my', label: 'My Documents' },
          ]}
        />

        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space>
            <Input
              placeholder="Search documents..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Category"
              allowClear
              style={{ width: 160 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'Policy', label: 'Policy' },
                { value: 'Template', label: 'Template' },
                { value: 'Letter', label: 'Letter' },
                { value: 'Certificate', label: 'Certificate' },
                { value: 'Form', label: 'Form' },
              ]}
            />
            <Button icon={<SlidersHorizontal size={16} />}>Filters</Button>
          </Space>
          <Space>
            <Tooltip title="Table View">
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<List size={16} />}
                onClick={() => setViewMode('table')}
              />
            </Tooltip>
            <Tooltip title="Grid View">
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<Grid3X3 size={16} />}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
          </Space>
        </Space>

        {viewMode === 'table' ? (
          <Table
            dataSource={filteredDocs}
            columns={columns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} documents` }}
          />
        ) : (
          renderGridView()
        )}
      </Card>

      <Modal
        title="Upload Document"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => { form.validateFields().then(() => { setIsModalOpen(false); form.resetFields(); }); }}
        okText="Upload"
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter document title' }]}>
            <Input placeholder="Enter document title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of the document" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Select a category' }]}>
                <Select placeholder="Select category" options={[
                  { value: 'Policy', label: 'Policy' },
                  { value: 'Template', label: 'Template' },
                  { value: 'Letter', label: 'Letter' },
                  { value: 'Certificate', label: 'Certificate' },
                  { value: 'Form', label: 'Form' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employee" label="Employee (optional)">
                <Select placeholder="Select employee" allowClear options={[
                  { value: 'Rahul Sharma', label: 'Rahul Sharma' },
                  { value: 'Priya Singh', label: 'Priya Singh' },
                  { value: 'Amit Patel', label: 'Amit Patel' },
                  { value: 'Sneha Gupta', label: 'Sneha Gupta' },
                  { value: 'Vikram Joshi', label: 'Vikram Joshi' },
                  { value: 'Ananya Reddy', label: 'Ananya Reddy' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="file" label="Upload File" rules={[{ required: true, message: 'Please upload a file' }]}>
            <Dragger
              maxCount={1}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            >
              <p style={{ marginBottom: 8 }}>
                <UploadIcon size={32} style={{ color: '#1a56db' }} />
              </p>
              <p><Text strong>Click or drag file to upload</Text></p>
              <p><Text type="secondary" style={{ fontSize: 12 }}>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10 MB)</Text></p>
            </Dragger>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expiryDate" label="Expiry Date">
                <DatePicker style={{ width: '100%' }} placeholder="Select expiry date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Tags">
                <Select mode="tags" placeholder="Add tags" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isPublic" valuePropName="checked">
            <Checkbox>Make this document publicly accessible to all employees</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentList;

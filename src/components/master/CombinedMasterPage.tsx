import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Space, Typography, App, Table, Popconfirm, Input } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import type { FormInstance } from 'antd/es/form';

const { Title } = Typography;

export interface ColumnDef {
  title: string;
  dataIndex: string;
  key?: string;
  width?: number;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  filterable?: boolean;
}

interface Props {
  title: string;
  /** Render the form fields (Ant Design Form.Items). */
  renderForm: (form: FormInstance, editingRow: any) => React.ReactNode;
  /** Columns to display in the list. SNo is auto-added. */
  columns: ColumnDef[];
  /** Rows currently shown in the list. */
  rows: any[];
  isLoading?: boolean;
  /** Default values applied to Form. Passed as initialValues. */
  initialValues?: Record<string, any>;
  /** Return an object with the payload to send to create/update. */
  onSubmit: (values: any, editingRow: any) => Promise<void>;
  /** Delete one row by id. */
  onDelete: (id: string) => Promise<void>;
  /** Transform a row into the form's edit values. Defaults to row itself. */
  toFormValues?: (row: any) => Record<string, any>;
  /** Optional right-side header button (e.g. "List" shortcut). */
  headerRight?: React.ReactNode;
  /** Hide the Clear button (some screenshots don't show it). */
  hideClearButton?: boolean;
  /** "Close" action — defaults to clear form. */
  onClose?: () => void;
  /** Layout: 'side-by-side' (form left, list right) or 'stacked' (form top, list below). */
  layout?: 'side-by-side' | 'stacked';
}

/**
 * CombinedMasterPage — the "Add + List on one page" pattern that repeats across
 * nearly every NwayERP master screen. Edit a row → form on the left populates;
 * Save → persist; Clear → reset form.
 *
 * Callers drive *all* form content via `renderForm` (so field layout stays
 * faithful to each screenshot), while this component handles: the list table,
 * per-column filter inputs, Save/Clear/Close buttons, edit/delete actions, and
 * confirm-dialog plumbing.
 */
export default function CombinedMasterPage({
  title,
  renderForm,
  columns,
  rows,
  isLoading,
  initialValues,
  onSubmit,
  onDelete,
  toFormValues,
  headerRight,
  hideClearButton,
  onClose,
  layout = 'side-by-side',
}: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [editingRow, setEditingRow] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Per-column filter values; keyed by dataIndex.
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRow) {
      form.setFieldsValue(toFormValues ? toFormValues(editingRow) : editingRow);
    }
  }, [editingRow, form, toFormValues]);

  const reset = () => {
    form.resetFields();
    setEditingRow(null);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await onSubmit(values, editingRow);
      message.success(editingRow ? 'Updated' : 'Saved');
      reset();
    } catch (err: any) {
      message.error(err?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      message.success('Deleted');
      if (editingRow && (editingRow._id || editingRow.id) === id) reset();
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete');
    }
  };

  const numbered = useMemo(() => rows.map((r, i) => ({ ...r, _sno: i + 1 })), [rows]);
  const filtered = useMemo(() => {
    return numbered.filter((r) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue;
        const cellVal = key === '_sno' ? String(r._sno) : String(r[key] ?? '');
        if (!cellVal.toLowerCase().includes(value.toLowerCase())) return false;
      }
      return true;
    });
  }, [numbered, filters]);

  const tableColumns = [
    { title: 'SNo.', dataIndex: '_sno', key: '_sno', width: 70 },
    ...columns.map((c) => ({
      title: c.title,
      dataIndex: c.dataIndex,
      key: c.key ?? c.dataIndex,
      width: c.width,
      align: c.align,
      render: c.render,
    })),
    {
      title: 'Edit',
      key: 'edit',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Button
          type="text"
          icon={<Edit2 size={16} />}
          onClick={() => {
            setEditingRow(r);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ),
    },
    {
      title: 'Del',
      key: 'del',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm
          title="Delete this record?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}
        >
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  const filterableColumns = columns.filter((c) => c.filterable !== false);

  const listNode = (
    <Card bordered={false}>
      {filterableColumns.length > 0 && (
        <div
          className="grid gap-2 mb-3"
          style={{
            gridTemplateColumns: `70px ${filterableColumns.map((c) => (c.width ? `${c.width}px` : '1fr')).join(' ')} 70px 70px`,
          }}
        >
          <Input
            size="small"
            placeholder="#"
            value={filters._sno ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, _sno: e.target.value }))}
          />
          {filterableColumns.map((c) => (
            <Input
              key={c.dataIndex}
              size="small"
              placeholder={`Filter ${c.title}`}
              value={filters[c.dataIndex] ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, [c.dataIndex]: e.target.value }))}
              allowClear
            />
          ))}
          <div />
          <div />
        </div>
      )}
      <Table
        columns={tableColumns as any}
        dataSource={filtered}
        rowKey={(r: any) => r._id || r.id}
        loading={isLoading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  const formNode = (
    <Card bordered={false}>
      <Form form={form} layout="horizontal" onFinish={handleSubmit} initialValues={initialValues}>
        {renderForm(form, editingRow)}
        <div className="flex justify-center mt-2">
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save
            </Button>
            {!hideClearButton && <Button onClick={reset}>Clear</Button>}
            <Button
              onClick={() => {
                reset();
                onClose?.();
              }}
            >
              Close
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">
          {editingRow ? `Edit ${title}` : title}
        </Title>
        {headerRight}
      </div>

      {layout === 'stacked' ? (
        <div className="space-y-4">
          {formNode}
          {listNode}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {formNode}
          {listNode}
        </div>
      )}
    </div>
  );
}

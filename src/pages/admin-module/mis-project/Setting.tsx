import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Select, Button, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

const { Title, Text } = Typography;

type Project = { _id: string; name: string; code?: string };

export default function MisProjectSetting() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const [userId, setUserId] = useState<string | undefined>();
  const [available, setAvailable] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project[]>([]);

  // Highlighted rows in each list (multi-select before clicking arrow buttons).
  const [availableHighlight, setAvailableHighlight] = useState<string[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<string[]>([]);

  // ─── Data ────────────────────────────────────────────────────────────────
  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  const { data: branchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
  });
  const allProjects: Project[] = ((branchesData as any)?.data ?? []) as any[];

  const { data: existingSetting } = useQuery({
    queryKey: ['mis-project-by-user', userId],
    queryFn: () => api.get(`/mis-project-settings/by-user/${userId}`),
    enabled: !!userId,
  });

  // Reset lists whenever the picked user changes.
  useEffect(() => {
    if (!userId) {
      setAvailable([]);
      setSelected([]);
      setAvailableHighlight([]);
      setSelectedHighlight([]);
      return;
    }
    const existing = (existingSetting as any)?.data;
    const selectedIds = new Set<string>(
      (existing?.projects || []).map((p: any) => (typeof p === 'object' ? p._id : p)),
    );
    const sel: Project[] = [];
    const avail: Project[] = [];
    for (const p of allProjects) {
      if (selectedIds.has(p._id)) sel.push(p);
      else avail.push(p);
    }
    setSelected(sel);
    setAvailable(avail);
    setAvailableHighlight([]);
    setSelectedHighlight([]);
  }, [userId, existingSetting, allProjects]);

  const userOptions = useMemo(() =>
    users
      .map((u) => ({
        value: u._id || u.id,
        label: (u.username || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim()).toUpperCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [users]);

  // ─── List <-> List move handlers ─────────────────────────────────────────
  const moveToSelected = () => {
    if (availableHighlight.length === 0) return;
    const moving = available.filter((p) => availableHighlight.includes(p._id));
    setSelected((s) => [...s, ...moving].sort((a, b) => a.name.localeCompare(b.name)));
    setAvailable((s) => s.filter((p) => !availableHighlight.includes(p._id)));
    setAvailableHighlight([]);
  };
  const moveToAvailable = () => {
    if (selectedHighlight.length === 0) return;
    const moving = selected.filter((p) => selectedHighlight.includes(p._id));
    setAvailable((s) => [...s, ...moving].sort((a, b) => a.name.localeCompare(b.name)));
    setSelected((s) => s.filter((p) => !selectedHighlight.includes(p._id)));
    setSelectedHighlight([]);
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: (data: any) => api.post('/mis-project-settings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-project-by-user', userId] });
      message.success('MIS project setting saved');
    },
    onError: (err: any) => message.error(err?.message || 'Failed to save'),
  });

  const handleSave = async () => {
    if (!userId) {
      message.error('Select a user');
      return;
    }
    await saveMut.mutateAsync({
      user: userId,
      projects: selected.map((p) => p._id),
    });
  };

  // Toggle highlight on click — Ctrl/Meta = additive, plain click = single.
  const onItemClick = (
    list: 'avail' | 'selected',
    id: string,
    e: React.MouseEvent,
  ) => {
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    const setter = list === 'avail' ? setAvailableHighlight : setSelectedHighlight;
    setter((prev) => {
      if (!additive) return prev.includes(id) && prev.length === 1 ? [] : [id];
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const renderListBox = (
    title: string,
    items: Project[],
    highlights: string[],
    list: 'avail' | 'selected',
  ) => (
    <div className="flex flex-col h-[420px] border border-gray-300 dark:border-gray-700 rounded">
      <div className="px-3 py-1.5 font-semibold border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm">
        {title}
      </div>
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="p-3 text-xs text-gray-500">No projects</div>
        ) : (
          items.map((p) => (
            <div
              key={p._id}
              onClick={(e) => onItemClick(list, p._id, e)}
              className={[
                'px-3 py-1 text-sm cursor-pointer select-none',
                highlights.includes(p._id)
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-50 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {p.name}{p.code ? ` - ${p.code}` : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">MIS Project Setting</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">New Mode</Text>

        <Form layout="horizontal" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div />
            <Form.Item
              label={<span>User Name<span className="text-red-500">*</span></span>}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              required
            >
              <Select
                value={userId}
                onChange={setUserId}
                showSearch
                optionFilterProp="label"
                placeholder="Please Select"
                options={userOptions}
                allowClear
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-[1fr_60px_1fr] items-stretch gap-3 mt-2">
            {renderListBox('Company Projects', available, availableHighlight, 'avail')}
            <div className="flex flex-col items-center justify-center gap-2">
              <Button
                type="primary" danger size="small"
                disabled={!userId || availableHighlight.length === 0}
                onClick={moveToSelected}
                style={{ width: 40 }}
              >
                -&gt;
              </Button>
              <Button
                type="primary" danger size="small"
                disabled={!userId || selectedHighlight.length === 0}
                onClick={moveToAvailable}
                style={{ width: 40 }}
              >
                &lt;-
              </Button>
            </div>
            {renderListBox('MIS Selected Project', selected, selectedHighlight, 'selected')}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button type="primary" danger loading={saveMut.isPending} onClick={handleSave}>
              Save
            </Button>
            <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

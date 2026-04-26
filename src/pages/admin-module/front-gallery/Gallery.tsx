import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Upload, App } from 'antd';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

const { Title } = Typography;

const SLOTS = 6;

type SlotImage = { url?: string; title: string };

export default function FrontImageGallery() {
  const { message } = App.useApp();
  const qc = useQueryClient();

  const [slots, setSlots] = useState<SlotImage[]>(
    Array.from({ length: SLOTS }, (_, i) => ({ title: `Gallery Image ${i + 1}` })),
  );

  // Single bucket entry per slot — uses ImageGallery model, one entry per slot
  // keyed by `frontGallerySlot${i}`.
  const { data } = useQuery({
    queryKey: ['front-gallery'],
    queryFn: () => api.get('/image-galleries', { limit: '50' }),
  });
  const items: any[] = ((data as any)?.data ?? []) as any[];

  useEffect(() => {
    setSlots(Array.from({ length: SLOTS }, (_, i) => {
      const found = items.find((it: any) => it.title === `Gallery Image ${i + 1}`);
      return { title: `Gallery Image ${i + 1}`, url: found?.imageUrl || found?.url };
    }));
  }, [data]);

  const saveMut = useMutation({
    mutationFn: async (slot: SlotImage) => {
      const existing = items.find((it: any) => it.title === slot.title);
      const payload = { title: slot.title, imageUrl: slot.url };
      if (existing) return api.put(`/image-galleries/${existing._id}`, payload);
      return api.post('/image-galleries', payload);
    },
  });

  const handleSaveAll = async () => {
    try {
      for (const s of slots) {
        if (s.url) await saveMut.mutateAsync(s);
      }
      qc.invalidateQueries({ queryKey: ['front-gallery'] });
      message.success('Gallery saved');
    } catch (err: any) {
      message.error(err?.message || 'Save failed');
    }
  };

  const onUpload = (idx: number, url: string) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, url } : s)));
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Front Image Gallery</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {slots.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-32 border border-gray-300 dark:border-gray-700 rounded overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  {s.url
                    ? <img src={s.url} alt={s.title} className="object-cover w-full h-full" />
                    : <span className="text-xs text-gray-400">No image</span>}
                </div>
                <Upload
                  showUploadList={false}
                  action="/api/v1/upload"
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      const url = info.file.response?.url || info.file.response?.data?.url;
                      if (url) onUpload(i, url);
                    }
                  }}
                >
                  <Button
                    shape="circle"
                    size="small"
                    icon={<Plus size={14} />}
                    className="!absolute -top-2 -right-2 shadow"
                  />
                </Upload>
              </div>
              <div className="mt-2 text-sm font-semibold">{s.title}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" danger loading={saveMut.isPending} onClick={handleSaveAll}>Save</Button>
          <Button danger onClick={() => window.history.back()}>Close</Button>
        </div>
      </Card>
    </div>
  );
}

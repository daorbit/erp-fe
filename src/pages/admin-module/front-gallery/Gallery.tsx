import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Button, App, Spin, Image } from 'antd';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useUploadImage } from '@/hooks/queries/useUpload';

const { Title } = Typography;

const SLOTS = 6;

type SlotImage = { url?: string; title: string };

export default function FrontImageGallery() {
  const { message } = App.useApp();
  const qc = useQueryClient();
  const uploadMutation = useUploadImage();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || pendingIdx === null) return;
    const idx = pendingIdx;
    setUploadingIdx(idx);
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: 'gallery' });
      const url = (result as any)?.data?.url || (result as any)?.url;
      if (url) onUpload(idx, url);
      else message.error('Upload failed: no URL returned');
    } catch (err: any) {
      message.error(err?.message || 'Upload failed');
    } finally {
      setUploadingIdx(null);
      setPendingIdx(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (idx: number) => {
    setPendingIdx(idx);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Front Image Gallery</Title>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {slots.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-48 h-32 border border-gray-300 dark:border-gray-700 rounded overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  {uploadingIdx === i
                    ? <Spin size="small" />
                    : s.url
                      ? (
                        <Image
                          src={s.url}
                          alt={s.title}
                          className="!object-cover !w-full !h-full"
                          preview={{ mask: <span className="text-white text-xs">Preview</span> }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )
                      : <span className="text-xs text-gray-400">No image</span>}
                </div>
                <Button
                  shape="circle"
                  size="small"
                  icon={<Plus size={14} />}
                  className="!absolute -top-2 -right-2 shadow"
                  loading={uploadingIdx === i}
                  onClick={() => triggerUpload(i)}
                />
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

import React, { useRef, useState } from 'react';
import { Form, Input, Checkbox, Button, App, Spin } from 'antd';
import { Upload as UploadIcon, X } from 'lucide-react';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { imageGalleryHooks } from '@/hooks/queries/usePhase2';
import { useUploadImage } from '@/hooks/queries/useUpload';

/** Inline image upload field for use inside a Form.Item */
function ImageUploadField({ value, onChange }: { value?: string; onChange?: (url: string) => void }) {
  const { message } = App.useApp();
  const uploadMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: 'gallery' });
      const url = (result as any)?.data?.url || (result as any)?.url;
      if (url) onChange?.(url);
      else message.error('Upload failed: no URL returned');
    } catch (err: any) {
      message.error(err?.message || 'Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative inline-block w-32 h-20">
          <img src={value} alt="gallery" className="w-32 h-20 object-cover rounded border" />
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
          >
            <X size={10} />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2 items-center">
        <Button
          size="small"
          icon={uploadMutation.isPending ? <Spin size="small" /> : <UploadIcon size={14} />}
          onClick={() => fileInputRef.current?.click()}
          loading={uploadMutation.isPending}
        >
          {value ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
      {/* Also allow manual URL entry (e.g. YouTube links) */}
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Or paste image / YouTube URL"
        size="small"
      />
    </div>
  );
}

const ImageGalleryPage: React.FC = () => {
  const { data, isLoading } = imageGalleryHooks.useList();
  const create = imageGalleryHooks.useCreate();
  const update = imageGalleryHooks.useUpdate();
  const del = imageGalleryHooks.useDelete();

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _isShow: r.isShow ? 'YES' : 'NO',
  }));

  return (
    <CombinedMasterPage
      title="Image Gallery"
      rows={rows}
      isLoading={isLoading}
      columns={[
        { title: 'Title Name', dataIndex: 'title' },
        { title: 'Image URL', dataIndex: 'imageUrl' },
        { title: 'Is Show', dataIndex: '_isShow', width: 100 },
      ]}
      initialValues={{ isShow: false, isYoutubeVideo: false }}
      toFormValues={(r) => ({
        title: r.title, imageUrl: r.imageUrl,
        isShow: !!r.isShow, isYoutubeVideo: !!r.isYoutubeVideo,
      })}
      renderForm={() => (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          <Form.Item name="title" label="Title Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Gallery Image" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <ImageUploadField />
          </Form.Item>
          <Form.Item name="isShow" valuePropName="checked" label="Is Show" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Checkbox />
          </Form.Item>
          <Form.Item name="isYoutubeVideo" valuePropName="checked" label="Is Youtube Video" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
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

export default ImageGalleryPage;

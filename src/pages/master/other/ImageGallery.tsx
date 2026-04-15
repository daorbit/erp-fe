import React from 'react';
import { Form, Input, Checkbox } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { imageGalleryHooks } from '@/hooks/queries/usePhase2';

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
          <Form.Item name="imageUrl" label="Gallery Image (URL)" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input placeholder="Image URL or YouTube link" />
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

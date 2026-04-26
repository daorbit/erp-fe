import { Modal } from 'antd';

// Centralised confirmation prompts so destructive actions across the app
// share the same wording, button labels, and `okType: 'danger'` styling.
// Used inside Dropdown menu items where Popconfirm is awkward to wrap.

interface ConfirmDeleteOpts {
  title?: string;
  content?: string;
  onOk: () => void | Promise<void>;
}

export function confirmDelete({
  title = 'Confirm delete',
  content = 'This action cannot be undone.',
  onOk,
}: ConfirmDeleteOpts) {
  Modal.confirm({
    title,
    content,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk,
  });
}

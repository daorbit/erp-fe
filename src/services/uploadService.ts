import api from './api';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

const uploadService = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    return api.upload<UploadResult>(`/upload/image${query}`, formData);
  },

  deleteImage: (publicId: string) =>
    api.post<null>('/upload/image/delete', { publicId }),
};

export default uploadService;

import { useMutation } from '@tanstack/react-query';
import uploadService from '@/services/uploadService';

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadService.uploadImage(file, folder),
  });
}

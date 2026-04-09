import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../../services/authService';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authService.getProfile(),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authService.login(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: any) => authService.register(data),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (data: { refreshToken: string }) => authService.refreshToken(data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

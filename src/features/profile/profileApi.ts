import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';
import { StaffUser } from '../users/usersApi';

export interface UpdateProfilePayload {
  phone?: string;
  profilePhoto?: {
    url: string;
    publicId: string;
  };
}

export interface ChangePasswordPayload {
  newPassword?: string;
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<StaffUser>, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Staff' as const, id: result.data.id },
              { type: 'Staff' as const, id: 'me' },
            ]
          : [{ type: 'Staff' as const, id: 'me' }],
    }),
    updateProfile: builder.mutation<ApiResponse<StaffUser>, UpdateProfilePayload>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result) =>
        result?.data
          ? [
              { type: 'Staff' as const, id: result.data.id },
              { type: 'Staff' as const, id: 'me' },
              { type: 'Staff' as const, id: 'LIST' },
            ]
          : [
              { type: 'Staff' as const, id: 'me' },
              { type: 'Staff' as const, id: 'LIST' },
            ],
    }),
    changeProfilePassword: builder.mutation<ApiResponse<{ message: string }>, { id: string; body: ChangePasswordPayload }>({
      query: ({ id, body }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword: body.newPassword },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Staff' as const, id },
        { type: 'Staff' as const, id: 'me' },
      ],
    }),
    uploadProfilePhoto: builder.mutation<ApiResponse<{ url: string; publicId: string }>, FormData>({
      query: (formData) => ({
        url: '/uploads/image?folder=users',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangeProfilePasswordMutation,
  useUploadProfilePhotoMutation,
} = profileApi;
export default profileApi;

import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  _id?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface StaffUser {
  id: string;
  shopId: string;
  fullName: string;
  email: string;
  phone?: string;
  isOwner: boolean;
  isActive: boolean;
  role: UserRole;
  employeeId?: string;
  joiningDate?: string;
  department?: string;
  emergencyContact?: EmergencyContact;
  profilePhoto?: { url: string; publicId: string };
  lastLoginAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListStaffQueryParams {
  roleId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListStaffResponse {
  items: StaffUser[];
  total: number;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  employeeId?: string;
  joiningDate?: string;
  department?: string;
  emergencyContact?: EmergencyContact;
}

export interface CreateStaffResult {
  user: StaffUser;
  temporaryPassword?: string;
}

export interface UpdateStaffPayload {
  fullName?: string;
  phone?: string;
  employeeId?: string;
  joiningDate?: string;
  department?: string;
  emergencyContact?: EmergencyContact;
}

export interface ChangeRolePayload {
  roleId: string;
}

export interface ResetPasswordPayload {
  newPassword?: string;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<ApiResponse<StaffUser[]>, ListStaffQueryParams>({
      query: (params) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff' as const, id: 'LIST' },
            ]
          : [{ type: 'Staff' as const, id: 'LIST' }],
    }),
    getStaffById: builder.query<ApiResponse<StaffUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Staff' as const, id }],
    }),
    createStaff: builder.mutation<ApiResponse<CreateStaffResult>, CreateStaffPayload>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Staff' as const, id: 'LIST' }],
    }),
    updateStaff: builder.mutation<ApiResponse<StaffUser>, { id: string; body: UpdateStaffPayload }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Staff' as const, id },
        { type: 'Staff' as const, id: 'LIST' },
      ],
    }),
    changeStaffRole: builder.mutation<ApiResponse<StaffUser>, { id: string; body: ChangeRolePayload }>({
      query: ({ id, body }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Staff' as const, id },
        { type: 'Staff' as const, id: 'LIST' },
      ],
    }),
    deactivateStaff: builder.mutation<ApiResponse<StaffUser>, string>({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Staff' as const, id },
        { type: 'Staff' as const, id: 'LIST' },
      ],
    }),
    reactivateStaff: builder.mutation<ApiResponse<StaffUser>, string>({
      query: (id) => ({
        url: `/users/${id}/reactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Staff' as const, id },
        { type: 'Staff' as const, id: 'LIST' },
      ],
    }),
    resetStaffPassword: builder.mutation<ApiResponse<{ message: string }>, { id: string; body: ResetPasswordPayload }>({
      query: ({ id, body }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword: body.newPassword },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Staff' as const, id }],
    }),
    getRolesList: builder.query<ApiResponse<UserRole[]>, void>({
      query: () => ({
        url: '/users/roles',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useChangeStaffRoleMutation,
  useDeactivateStaffMutation,
  useReactivateStaffMutation,
  useResetStaffPasswordMutation,
  useGetRolesListQuery,
} = usersApi;
export default usersApi;

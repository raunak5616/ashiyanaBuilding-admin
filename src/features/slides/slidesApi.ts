import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface Slide {
  id: string;
  shopId: string;
  imageUrl: string;
  publicId: string;
  categoryId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export const slidesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSlides: builder.query<ApiResponse<Slide[]>, void>({
      query: () => '/slides',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Slide' as const, id })),
              { type: 'Slide' as const, id: 'LIST' },
            ]
          : [{ type: 'Slide' as const, id: 'LIST' }],
    }),
    createSlide: builder.mutation<ApiResponse<Slide>, FormData>({
      query: (formData) => ({
        url: '/slides',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Slide' as const, id: 'LIST' }],
    }),
    deleteSlide: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/slides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Slide' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSlidesQuery,
  useCreateSlideMutation,
  useDeleteSlideMutation,
} = slidesApi;

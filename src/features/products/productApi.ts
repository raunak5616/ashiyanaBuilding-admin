import { apiSlice } from '@/api/apiSlice';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ProductImage {
  url: string;
  publicId: string;
  altText?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  unitId: string;
  description?: string;
  sellingPrice: number; // stored in paise on backend
  purchasePrice: number; // stored in paise on backend
  taxRate: number;
  minimumStock: number;
  images: ProductImage[];
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: string;
  shopId: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListProductsQueryParams {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  unitId: string;
  description?: string;
  sellingPrice: number; // in paise
  purchasePrice: number; // in paise
  taxRate: number;
  minimumStock?: number;
  images?: ProductImage[];
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  description?: string;
  sellingPrice?: number; // in paise
  purchasePrice?: number; // in paise
  taxRate?: number;
  minimumStock?: number;
  images?: ProductImage[];
}

export interface CreateCategoryPayload {
  name: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  parentCategoryId?: string;
}

export interface CreateBrandPayload {
  name: string;
}

export interface UpdateBrandPayload {
  name: string;
}

export interface CreateUnitPayload {
  name: string;
  abbreviation: string;
}

export interface UpdateUnitPayload {
  name?: string;
  abbreviation?: string;
}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- PRODUCTS ----
    getProducts: builder.query<ApiResponse<Product[]>, ListProductsQueryParams>({
      query: (params) => ({
        url: '/products',
        method: 'GET',
        params: {
          ...params,
          // Convert boolean to string expected by backend query validator if necessary
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    getProductById: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product' as const, id }],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, CreateProductPayload>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }],
    }),
    updateProduct: builder.mutation<ApiResponse<Product>, { id: string; body: UpdateProductPayload }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),
    archiveProduct: builder.mutation<ApiResponse<Product>, string>({
      query: (id) => ({
        url: `/products/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),
    restoreProduct: builder.mutation<ApiResponse<Product>, string>({
      query: (id) => ({
        url: `/products/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
      ],
    }),

    // ---- CATEGORIES ----
    getCategories: builder.query<ApiResponse<Category[]>, { isActive?: boolean; parentCategoryId?: string } | void>({
      query: (params) => ({
        url: '/categories',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryPayload>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Category' as const, id: 'LIST' }],
    }),
    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; body: UpdateCategoryPayload }>({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),
    archiveCategory: builder.mutation<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `/categories/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),
    restoreCategory: builder.mutation<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `/categories/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),

    // ---- BRANDS ----
    getBrands: builder.query<ApiResponse<Brand[]>, { isActive?: boolean } | void>({
      query: (params) => ({
        url: '/brands',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand' as const, id: 'LIST' },
            ]
          : [{ type: 'Brand' as const, id: 'LIST' }],
    }),
    createBrand: builder.mutation<ApiResponse<Brand>, CreateBrandPayload>({
      query: (body) => ({
        url: '/brands',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Brand' as const, id: 'LIST' }],
    }),
    updateBrand: builder.mutation<ApiResponse<Brand>, { id: string; body: UpdateBrandPayload }>({
      query: ({ id, body }) => ({
        url: `/brands/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Brand' as const, id },
        { type: 'Brand' as const, id: 'LIST' },
      ],
    }),
    archiveBrand: builder.mutation<ApiResponse<Brand>, string>({
      query: (id) => ({
        url: `/brands/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Brand' as const, id },
        { type: 'Brand' as const, id: 'LIST' },
      ],
    }),
    restoreBrand: builder.mutation<ApiResponse<Brand>, string>({
      query: (id) => ({
        url: `/brands/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Brand' as const, id },
        { type: 'Brand' as const, id: 'LIST' },
      ],
    }),

    // ---- UNITS ----
    getUnits: builder.query<ApiResponse<Unit[]>, { isActive?: boolean } | void>({
      query: (params) => ({
        url: '/units',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Unit' as const, id })),
              { type: 'Unit' as const, id: 'LIST' },
            ]
          : [{ type: 'Unit' as const, id: 'LIST' }],
    }),
    createUnit: builder.mutation<ApiResponse<Unit>, CreateUnitPayload>({
      query: (body) => ({
        url: '/units',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Unit' as const, id: 'LIST' }],
    }),
    updateUnit: builder.mutation<ApiResponse<Unit>, { id: string; body: UpdateUnitPayload }>({
      query: ({ id, body }) => ({
        url: `/units/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Unit' as const, id },
        { type: 'Unit' as const, id: 'LIST' },
      ],
    }),
    archiveUnit: builder.mutation<ApiResponse<Unit>, string>({
      query: (id) => ({
        url: `/units/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Unit' as const, id },
        { type: 'Unit' as const, id: 'LIST' },
      ],
    }),
    restoreUnit: builder.mutation<ApiResponse<Unit>, string>({
      query: (id) => ({
        url: `/units/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Unit' as const, id },
        { type: 'Unit' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useArchiveProductMutation,
  useRestoreProductMutation,
  // Categories
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useArchiveCategoryMutation,
  useRestoreCategoryMutation,
  // Brands
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useArchiveBrandMutation,
  useRestoreBrandMutation,
  // Units
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useArchiveUnitMutation,
  useRestoreUnitMutation,
} = productApi;

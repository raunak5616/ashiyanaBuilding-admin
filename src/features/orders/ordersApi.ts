import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';
import { Product } from '../products/productApi';

export interface OrderItem {
  productId: Product;
  quantity: number;
  unitPrice: number; // in paise
  tax: number; // in paise
  discount: number; // in paise
}

export interface ShippingAddress {
  receiverName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customerUserId: {
    id: string;
    fullName: string;
    email?: string;
  };
  items: OrderItem[];
  subtotal: number; // in paise
  tax: number; // in paise
  discount: number; // in paise
  grandTotal: number; // in paise
  status: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash' | 'online';
  walletAmountUsed?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersQueryParams {
  status?: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<Order[]>, ListOrdersQueryParams | void>({
      query: (params) => ({
        url: '/orders',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((order) => ({ type: 'Order' as const, id: order.id || order._id || '' })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),
    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order' as const, id }],
    }),
    approveOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
        { type: 'Inventory' as const, id: 'LIST' }, // inventory changes on sales invoice creation
        { type: 'Sale' as const, id: 'LIST' }, // ERP Sale gets created on order approval
      ],
    }),
    rejectOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
      ],
    }),
    dispatchOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/dispatch`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
      ],
    }),
    deliverOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/deliver`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useApproveOrderMutation,
  useRejectOrderMutation,
  useDispatchOrderMutation,
  useDeliverOrderMutation,
} = ordersApi;
export default ordersApi;

import React, { useState } from 'react';
import AppCard from '@/components/common/AppCard';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorPage from '@/components/common/ErrorPage';

// Import queries & mutations
import {
  useGetOrdersQuery,
  useApproveOrderMutation,
  useRejectOrderMutation,
  useDispatchOrderMutation,
  useDeliverOrderMutation,
  Order,
} from '../ordersApi';

// MUI components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// MUI icons
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

export const OrderListScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Queries for live orders - poll every 5 seconds!
  const {
    data: ordersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetOrdersQuery(
    {
      status: statusFilter === 'all' ? undefined : (statusFilter as any),
      search: search.trim() || undefined,
    },
    {
      pollingInterval: 5000, // Live reflect orders!
    }
  );

  const [approveOrder, { isLoading: isApproving }] = useApproveOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [dispatchOrder, { isLoading: isDispatching }] = useDispatchOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();

  const orders = ordersResponse?.data || [];
  const isUpdating = isApproving || isRejecting || isDispatching || isDelivering;

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setDetailsOpen(false);
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChip = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Chip label="PENDING" size="small" className="!bg-amber-50 !text-amber-700 !border-amber-100 !font-sans !font-bold" variant="outlined" />;
      case 'approved':
        return <Chip label="APPROVED" size="small" className="!bg-sky-50 !text-sky-700 !border-sky-100 !font-sans !font-bold" variant="outlined" />;
      case 'dispatched':
        return <Chip label="DISPATCHED" size="small" className="!bg-orange-50 !text-orange-700 !border-orange-100 !font-sans !font-bold" variant="outlined" />;
      case 'delivered':
        return <Chip label="DELIVERED" size="small" className="!bg-emerald-50 !text-emerald-700 !border-emerald-100 !font-sans !font-bold" variant="outlined" />;
      case 'cancelled':
        return <Chip label="CANCELLED" size="small" className="!bg-rose-50 !text-rose-700 !border-rose-100 !font-sans !font-bold" variant="outlined" />;
      default:
        return <Chip label={(status as any).toUpperCase()} size="small" className="!font-sans !font-bold" />;
    }
  };

  const getPaymentStatusChip = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid':
        return <Chip label="PAID" size="small" className="!bg-emerald-50 !text-emerald-700 !border-emerald-200 !font-sans !font-bold text-[10px]" variant="outlined" />;
      case 'pending':
        return <Chip label="UNPAID" size="small" className="!bg-amber-50 !text-amber-700 !border-amber-200 !font-sans !font-bold text-[10px]" variant="outlined" />;
      default:
        return <Chip label={paymentStatus.toUpperCase()} size="small" className="!font-sans !font-bold text-[10px]" />;
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'dispatch' | 'deliver', orderId: string) => {
    try {
      if (action === 'approve') {
        await approveOrder(orderId).unwrap();
      } else if (action === 'reject') {
        await rejectOrder(orderId).unwrap();
      } else if (action === 'dispatch') {
        await dispatchOrder(orderId).unwrap();
      } else if (action === 'deliver') {
        await deliverOrder(orderId).unwrap();
      }
      // If modal is open, refresh detail info
      if (selectedOrder && selectedOrder.id === orderId) {
        handleCloseDetails();
      }
    } catch (err: any) {
      alert(err?.data?.message || `Failed to perform action: ${action}`);
    }
  };

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load orders"
        message={(error as any)?.data?.message || 'Server error. Please verify database connection.'}
      />
    );
  }

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-secondary font-heading leading-tight flex items-center gap-2">
            Live Customer Orders
            <RefreshIcon className={`h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600 ${isFetching ? 'animate-spin' : ''}`} onClick={() => refetch()} />
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Track and process incoming orders from Ashiyana mobile app. (Refreshes automatically every 5s)
          </p>
        </div>
      </div>

      <AppCard>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
          <TextField
            placeholder="Search by order #, phone, or name..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-md w-full !bg-slate-50"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="h-4 w-4 text-slate-400" />
                  </InputAdornment>
                ),
                className: '!rounded-xl !text-xs font-sans',
              },
            }}
          />

          <FormControl size="small" className="w-full md:w-48 !m-0">
            <InputLabel id="order-status-filter-label" className="!text-xs !font-bold !font-sans">Order Status</InputLabel>
            <Select
              labelId="order-status-filter-label"
              value={statusFilter}
              label="Order Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              className="!text-xs !font-bold !font-sans !bg-slate-50 !rounded-xl"
              classes={{ select: '!py-2 !px-3' }}
            >
              <MenuItem value="all" className="!text-xs !font-sans">All Orders</MenuItem>
              <MenuItem value="pending" className="!text-xs !font-sans">Pending</MenuItem>
              <MenuItem value="approved" className="!text-xs !font-sans">Approved</MenuItem>
              <MenuItem value="dispatched" className="!text-xs !font-sans">Dispatched</MenuItem>
              <MenuItem value="delivered" className="!text-xs !font-sans">Delivered</MenuItem>
              <MenuItem value="cancelled" className="!text-xs !font-sans">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Table list */}
        <div className="relative">
          {(isLoading || isUpdating) && <LoadingOverlay message="Syncing live orders..." />}

          <TableContainer component={Paper} className="!shadow-none !border !border-slate-100 !rounded-xl overflow-hidden">
            <Table size="medium">
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">ORDER NUMBER</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">CUSTOMER</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">ITEMS</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">PAYMENT</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">TOTAL</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">DATE</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !text-xs !font-sans">STATUS</TableCell>
                  <TableCell align="right" className="!font-bold !text-slate-500 !text-xs !font-sans">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="!text-slate-400 !text-xs !py-12 !font-sans">
                      No customer orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50/50">
                        <TableCell className="!font-bold !text-xs !text-slate-800 !font-sans">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="!text-xs !text-slate-700 !font-sans">
                          <div className="font-bold text-slate-800">{order.shippingAddress.receiverName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{order.shippingAddress.phone}</div>
                        </TableCell>
                        <TableCell className="!text-xs !text-slate-600 !font-sans">
                          {totalQty} {totalQty === 1 ? 'item' : 'items'}
                        </TableCell>
                        <TableCell className="!text-xs !font-sans">
                          <div className="capitalize font-bold text-slate-700">{order.paymentMethod}</div>
                          <div className="mt-0.5">{getPaymentStatusChip(order.paymentStatus)}</div>
                        </TableCell>
                        <TableCell className="!font-bold !text-xs !text-slate-900 !font-sans">
                          {formatPrice(order.grandTotal)}
                        </TableCell>
                        <TableCell className="!text-xs !text-slate-400 !font-sans">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="!text-xs !font-sans">
                          {getStatusChip(order.status)}
                        </TableCell>
                        <TableCell align="right" className="!p-2">
                          <div className="flex justify-end gap-1.5 items-center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetails(order)}
                              title="View Details"
                              className="hover:bg-slate-100"
                            >
                              <VisibilityIcon className="h-4.5 w-4.5 text-slate-500" />
                            </IconButton>

                            {order.status === 'pending' && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAction('approve', order.id)}
                                  title="Approve Order"
                                  className="hover:bg-emerald-50 text-emerald-600"
                                >
                                  <DoneIcon className="h-4.5 w-4.5" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAction('reject', order.id)}
                                  title="Reject Order"
                                  className="hover:bg-rose-50 text-rose-600"
                                >
                                  <CloseIcon className="h-4.5 w-4.5" />
                                </IconButton>
                              </>
                            )}

                            {order.status === 'approved' && (
                              <IconButton
                                size="small"
                                onClick={() => handleAction('dispatch', order.id)}
                                title="Dispatch Order"
                                className="hover:bg-orange-50 text-orange-600"
                              >
                                <LocalShippingIcon className="h-4.5 w-4.5" />
                              </IconButton>
                            )}

                            {order.status === 'dispatched' && (
                              <IconButton
                                size="small"
                                onClick={() => handleAction('deliver', order.id)}
                                title="Mark Delivered"
                                className="hover:bg-emerald-50 text-emerald-600"
                              >
                                <CheckCircleIcon className="h-4.5 w-4.5" />
                              </IconButton>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </AppCard>

      {/* Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              className: '!rounded-2xl !p-1 border border-slate-100 shadow-2xl max-w-[700px]',
            },
          }}
        >
          <DialogTitle className="!font-heading !font-black !text-lg !text-secondary !pb-1 !pt-4 !px-6 flex justify-between items-center">
            <span>Order Details: {selectedOrder.orderNumber}</span>
            <div>{getStatusChip(selectedOrder.status)}</div>
          </DialogTitle>
          <DialogContent className="!px-6 !py-4 space-y-5">
            {/* Grid details block */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div>
                <Typography className="!text-[10px] !font-bold text-slate-400 uppercase tracking-wide">
                  Customer Profile
                </Typography>
                <Typography className="!text-xs !font-bold text-slate-800 font-sans mt-0.5">
                  {selectedOrder.shippingAddress.receiverName}
                </Typography>
                <Typography className="!text-xs text-slate-500 font-sans">
                  Phone: {selectedOrder.shippingAddress.phone}
                </Typography>
              </div>

              <div>
                <Typography className="!text-[10px] !font-bold text-slate-400 uppercase tracking-wide">
                  Payment info
                </Typography>
                <Typography className="!text-xs !font-bold text-slate-800 font-sans mt-0.5 capitalize">
                  {selectedOrder.paymentMethod} Payment
                </Typography>
                <div className="mt-1">{getPaymentStatusChip(selectedOrder.paymentStatus)}</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-b border-slate-100 pb-4">
              <Typography className="!text-[10px] !font-bold text-slate-400 uppercase tracking-wide mb-1">
                Shipping Address
              </Typography>
              <Typography className="!text-xs text-slate-700 font-sans leading-relaxed">
                {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city},{' '}
                {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
              </Typography>
            </div>

            {/* Items summary */}
            <div>
              <Typography className="!text-[10px] !font-bold text-slate-400 uppercase tracking-wide mb-2">
                Items List
              </Typography>
              <TableContainer component={Paper} className="!shadow-none !border !border-slate-100 !rounded-xl overflow-hidden">
                <Table size="small">
                  <TableHead className="bg-slate-50">
                    <TableRow>
                      <TableCell className="!font-bold !text-slate-500 !text-[11px] !font-sans">PRODUCT NAME</TableCell>
                      <TableCell className="!font-bold !text-slate-500 !text-[11px] !font-sans" align="center">QTY</TableCell>
                      <TableCell className="!font-bold !text-slate-500 !text-[11px] !font-sans" align="right">UNIT PRICE</TableCell>
                      <TableCell className="!font-bold !text-slate-500 !text-[11px] !font-sans" align="right">TOTAL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="!text-xs !text-slate-800 !font-sans font-bold">
                          {item.productId?.name || 'Deleted Product'}
                        </TableCell>
                        <TableCell align="center" className="!text-xs !text-slate-600 !font-sans">
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" className="!text-xs !text-slate-600 !font-sans">
                          {formatPrice(item.unitPrice)}
                        </TableCell>
                        <TableCell align="right" className="!font-bold !text-xs !text-slate-800 !font-sans">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* Total pricing details */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-700">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>GST (18%):</span>
                  <span className="font-semibold text-slate-700">{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-100 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-primary-dark">{formatPrice(selectedOrder.grandTotal)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <Box className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <Typography className="!text-[10px] !font-bold text-slate-400 uppercase tracking-wide">
                  Order Notes
                </Typography>
                <Typography className="!text-xs text-slate-600 italic font-sans mt-0.5">
                  {selectedOrder.notes}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions className="!px-6 !pb-4 !pt-2 !flex !justify-between !items-center bg-slate-50 border-t border-slate-100">
            {/* Transition actions directly inside modal details */}
            <div className="flex gap-2">
              {selectedOrder.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<DoneIcon />}
                    onClick={() => handleAction('approve', selectedOrder.id)}
                    className="!bg-emerald-600 !text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleAction('reject', selectedOrder.id)}
                    className="!text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
                  >
                    Reject
                  </Button>
                </>
              )}

              {selectedOrder.status === 'approved' && (
                <Button
                  variant="contained"
                  startIcon={<LocalShippingIcon />}
                  onClick={() => handleAction('dispatch', selectedOrder.id)}
                  className="!bg-orange-600 !text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
                >
                  Dispatch
                </Button>
              )}

              {selectedOrder.status === 'dispatched' && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction('deliver', selectedOrder.id)}
                  className="!bg-emerald-600 !text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
                >
                  Mark Delivered
                </Button>
              )}
            </div>

            <Button
              onClick={handleCloseDetails}
              className="!text-slate-600 !text-xs !font-bold !py-1.5 !px-4 hover:bg-slate-100 !rounded-xl"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default OrderListScreen;

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';

import { useAuth } from '@/hooks/useAuth';
import StatusChip from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import {
  useGetPurchaseByIdQuery,
  useConfirmPurchaseMutation,
  useCancelPurchaseMutation,
} from '../purchaseApi';
import { useGetSuppliersQuery } from '../../suppliers/supplierApi';
import { useGetProductsQuery } from '../../products/productApi';

export const PurchaseDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  // Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // API Queries & Mutations
  const { data: purchaseResponse, isLoading: purchaseLoading, refetch } = useGetPurchaseByIdQuery(id || '');
  const { data: suppliersResponse, isLoading: suppliersLoading } = useGetSuppliersQuery(undefined);
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({});

  const [confirmPurchase, { isLoading: isConfirming }] = useConfirmPurchaseMutation();
  const [cancelPurchase, { isLoading: isCancelling }] = useCancelPurchaseMutation();

  const purchase = purchaseResponse?.data;
  const suppliers = suppliersResponse?.data || [];
  const products = productsResponse?.data || [];

  const isLoading = purchaseLoading || suppliersLoading || productsLoading;

  // Lookup structures
  const supplier = purchase ? suppliers.find((s) => s.id === purchase.supplierId) : null;
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Permission Gate
  const canConfirm = currentUser?.isOwner || currentUser?.role?.slug === 'manager';

  const formatCurrency = (amountInPaise: number) => {
    return (amountInPaise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusChipDetails = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { status: 'success' as const, label: 'Received' };
      case 'cancelled':
        return { status: 'error' as const, label: 'Cancelled' };
      default:
        return { status: 'warning' as const, label: 'Draft' };
    }
  };

  const handleConfirmOrder = async () => {
    if (!id) return;
    setErrorMsg('');
    try {
      await confirmPurchase(id).unwrap();
      setConfirmOpen(false);
      refetch();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to confirm stock intake.');
    }
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    setErrorMsg('');
    try {
      await cancelPurchase(id).unwrap();
      setCancelOpen(false);
      refetch();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to cancel purchase draft.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress className="text-slate-900" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <Alert severity="error" className="rounded-2xl font-sans">
        Purchase Order not found. It may have been deleted.
      </Alert>
    );
  }

  const statusDetails = getStatusChipDetails(purchase.status);

  return (
    <div className="space-y-6">
      {/* Header Banner - hidden during printing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm print:hidden select-none">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => navigate('/purchases')}
            className="hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-xl"
          >
            <ArrowBackIcon className="h-5 w-5" />
          </IconButton>
          <div>
            <h1 className="text-xl font-black text-secondary font-heading leading-tight">
              PO details: {purchase.purchaseNumber}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              View procurement status, print vouchers, and approve stock intake.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <Button
            onClick={handlePrint}
            variant="outlined"
            startIcon={<PrintIcon />}
            className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans hover:bg-slate-50 min-h-[42px]"
          >
            Print Voucher
          </Button>

          {purchase.status === 'draft' && (
            <>
              <Button
                onClick={() => navigate(`/purchases/${purchase.id}/edit`)}
                variant="outlined"
                startIcon={<EditIcon />}
                className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans hover:bg-slate-50 min-h-[42px]"
              >
                Edit Draft
              </Button>

              <Button
                onClick={() => setCancelOpen(true)}
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                className="rounded-xl capitalize font-sans min-h-[42px]"
              >
                Cancel Draft
              </Button>

              {canConfirm && (
                <Button
                  onClick={() => setConfirmOpen(true)}
                  variant="contained"
                  disableElevation
                  startIcon={<CheckCircleIcon />}
                  className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-4 min-h-[42px]"
                >
                  Receive Stock
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <Alert severity="error" className="rounded-2xl font-sans print:hidden">
          {errorMsg}
        </Alert>
      )}

      {/* Main Invoice Layout Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header details */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5">
            <Typography variant="h5" className="!font-heading !font-black !text-secondary select-none">
              AASHIYANA
            </Typography>
            <p className="text-xs text-slate-400 font-sans font-semibold uppercase tracking-wider">
              Building Materials Supplier Invoice
            </p>
          </div>

          <div className="text-right space-y-1 select-none">
            <span className="inline-block mb-1">
              <StatusChip status={statusDetails.status} label={statusDetails.label} />
            </span>
            <p className="text-sm font-black text-slate-800 font-mono">{purchase.purchaseNumber}</p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Vendor and Invoice metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supplier details info */}
          <div className="space-y-3">
            <Typography variant="subtitle2" className="!font-heading !font-bold text-slate-400 uppercase tracking-widest text-[11px] select-none">
              Supplier / Vendor
            </Typography>
            {supplier ? (
              <div className="space-y-1 text-sm">
                <p className="font-extrabold text-slate-800">{supplier.businessName}</p>
                <p className="text-slate-500 font-medium font-sans">Contact: {supplier.contactPerson || '—'}</p>
                <p className="text-slate-500 font-medium font-sans">Phone: {supplier.phone || '—'}</p>
                {supplier.email && <p className="text-slate-500 font-medium font-sans">Email: {supplier.email}</p>}
                {(supplier.address || supplier.city) && (
                  <p className="text-slate-400 font-medium font-sans text-xs mt-2 leading-relaxed">
                    {supplier.address}
                    {supplier.city && `, ${supplier.city}`}
                    {supplier.state && `, ${supplier.state}`}
                    {supplier.postalCode && ` - ${supplier.postalCode}`}
                  </p>
                )}
                {(supplier.gstNumber || supplier.panNumber) && (
                  <div className="text-[11px] font-mono text-slate-500 mt-2 space-y-0.5">
                    {supplier.gstNumber && <p>GSTIN: {supplier.gstNumber}</p>}
                    {supplier.panNumber && <p>PAN: {supplier.panNumber}</p>}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-sans italic">Loading supplier details...</p>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="space-y-3 md:text-right md:justify-self-end w-full max-w-xs select-none">
            <Typography variant="subtitle2" className="!font-heading !font-bold text-slate-400 uppercase tracking-widest text-[11px]">
              Procurement Meta
            </Typography>
            <div className="space-y-1.5 text-sm font-sans">
              <div className="flex justify-between md:justify-end md:gap-8">
                <span className="text-slate-400 font-semibold">Purchase Date:</span>
                <span className="font-bold text-slate-700">{formatDate(purchase.purchaseDate)}</span>
              </div>
              <div className="flex justify-between md:justify-end md:gap-8">
                <span className="text-slate-400 font-semibold">Invoice Number:</span>
                <span className="font-bold text-slate-700 font-mono">{purchase.invoiceNumber || '—'}</span>
              </div>
              <div className="flex justify-between md:justify-end md:gap-8">
                <span className="text-slate-400 font-semibold">Invoice Date:</span>
                <span className="font-bold text-slate-700">{formatDate(purchase.invoiceDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Items List Grid */}
        <div className="space-y-3">
          <Typography variant="subtitle2" className="!font-heading !font-bold text-slate-400 uppercase tracking-widest text-[11px] select-none">
            Priced Items List
          </Typography>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 select-none">
                  <th className="py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase font-sans">Product</th>
                  <th className="py-3 px-4 text-center text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Qty</th>
                  <th className="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-32">Unit Price</th>
                  <th className="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Tax</th>
                  <th className="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Discount</th>
                  <th className="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-32">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchase.items?.map((item) => {
                  const product = productMap.get(item.productId);
                  const unitName = product ? (product as any).unit?.name || 'Units' : 'Units';

                  return (
                    <tr key={item.id} className="text-sm font-sans text-slate-700">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{product?.name || 'Unknown Product'}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                          SKU: {product?.sku || 'N/A'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                        {item.quantity} <span className="text-[10px] font-normal text-slate-400 lowercase ml-0.5">{unitName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(item.purchasePrice)}</td>
                      <td className="py-3.5 px-4 text-right text-rose-500 font-medium">{item.tax ? formatCurrency(item.tax) : '—'}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">{item.discount ? formatCurrency(item.discount) : '—'}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-800">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and Totals Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Notes column */}
          <div className="space-y-3">
            <Typography variant="subtitle2" className="!font-heading !font-bold text-slate-400 uppercase tracking-widest text-[11px] select-none">
              Internal Notes
            </Typography>
            <p className="text-sm text-slate-500 font-sans bg-slate-50 border border-slate-150 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
              {purchase.notes || 'No internal remarks or shipping notes entered for this transaction.'}
            </p>
          </div>

          {/* Totals Summary */}
          <div className="space-y-3 md:justify-self-end w-full max-w-xs select-none">
            <Typography variant="subtitle2" className="!font-heading !font-bold text-slate-400 uppercase tracking-widest text-[11px]">
              Financial Calculation
            </Typography>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between text-slate-500">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">{formatCurrency(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span className="font-semibold">Discount:</span>
                <span className="font-bold">-{formatCurrency(purchase.discount)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span className="font-semibold">Tax:</span>
                <span className="font-bold">+{formatCurrency(purchase.tax)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span className="font-semibold">Shipping:</span>
                <span className="font-bold">+{formatCurrency(purchase.shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span className="font-semibold">Other Charges:</span>
                <span className="font-bold">+{formatCurrency(purchase.otherCharges)}</span>
              </div>
              <hr className="border-slate-100 my-1" />
              <div className="flex justify-between items-center py-1 text-secondary">
                <span className="font-black text-base">Grand Total:</span>
                <span className="font-black text-lg">{formatCurrency(purchase.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Intake Modal */}
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          title="Approve Stock Intake & Receive Inventory?"
          message="Are you sure you want to confirm this purchase order? This action is irreversible. The backend will immediately increment warehouse stock levels for all line items and generate permanent ledger entries."
          confirmText="Confirm & Receive"
          onConfirm={handleConfirmOrder}
          onClose={() => setConfirmOpen(false)}
          loading={isConfirming}
        />
      )}

      {/* Cancel Draft Modal */}
      {cancelOpen && (
        <ConfirmDialog
          open={cancelOpen}
          title="Cancel Purchase Draft?"
          message="Are you sure you want to cancel this purchase draft? This will lock the document status to Cancelled. It will not modify inventory stock counts."
          confirmText="Cancel PO"
          onConfirm={handleCancelOrder}
          onClose={() => setCancelOpen(false)}
          loading={isCancelling}
        />
      )}
    </div>
  );
};

export default PurchaseDetailsScreen;

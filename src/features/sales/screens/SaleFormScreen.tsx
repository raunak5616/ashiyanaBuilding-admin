import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// MUI Icons
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBackOutlined';

import AppCard from '@/components/common/AppCard';
import FormInput from '@/components/common/FormInput';
import { useGetCustomersQuery } from '../../customers/customerApi';
import { useGetProductsQuery } from '../../products/productApi';
import {
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useGetSaleByIdQuery,
  CreateSaleItemPayload,
} from '../salesApi';

interface FormLineItem {
  productId: string;
  quantity: number;
  priceAtSale: number; // in Rupees, read-only
  tax: number; // in Rupees
  discount: number; // in Rupees
  lineTotal: number; // in Rupees
}

export const SaleFormScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  // API Queries
  const { data: customersResponse, isLoading: customersLoading } = useGetCustomersQuery({ isActive: true });
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({ isActive: true });
  const { data: saleDetails, isLoading: saleLoading, error: loadError } = useGetSaleByIdQuery(id || '', {
    skip: !isEdit,
  });

  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation();
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();

  const customers = customersResponse?.data || [];
  const products = productsResponse?.data || [];

  // Form Fields State
  const [saleNumber, setSaleNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [notes, setNotes] = useState('');

  // Summary Charges (in Rupees)
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  // Line Items Grid State
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Load Sale Order details if editing
  useEffect(() => {
    if (isEdit && saleDetails?.data) {
      const s = saleDetails.data;
      if (s.status !== 'draft') {
        setErrorMsg('Only draft sales can be edited.');
        return;
      }
      setSaleNumber(s.saleNumber);
      setCustomerId(s.customerId || '');
      setSaleDate(s.saleDate ? s.saleDate.substring(0, 10) : '');
      setNotes(s.notes || '');

      setDiscount(s.discount / 100);
      setTax(s.tax / 100);

      if (s.items) {
        setItems(
          s.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.priceAtSale / 100,
            tax: (item.tax || 0) / 100,
            discount: (item.discount || 0) / 100,
            lineTotal: item.lineTotal / 100,
          }))
        );
      }
    } else if (!isEdit) {
      // Auto-generate a draft sale number prefix
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setSaleNumber(`SALE-DRAFT-${randomSuffix}`);
      setSaleDate(new Date().toISOString().substring(0, 10));
      setItems([{ productId: '', quantity: 1, priceAtSale: 0, tax: 0, discount: 0, lineTotal: 0 }]);
    }
  }, [saleDetails, isEdit]);

  // Update line total on value edits
  const calculateLineTotal = (qty: number, price: number, disc: number, tx: number) => {
    return qty * price - disc + tx;
  };

  const handleLineItemChange = (index: number, field: keyof FormLineItem, value: any) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index] };

      if (field === 'productId') {
        item.productId = value;
        // Pre-fill selling price from product catalogue
        const product = products.find((p) => p.id === value);
        if (product) {
          item.priceAtSale = product.sellingPrice / 100;
        } else {
          item.priceAtSale = 0;
        }
        item.quantity = 1;
        item.tax = 0;
        item.discount = 0;
      } else {
        (item as any)[field] = value;
      }

      item.lineTotal = calculateLineTotal(item.quantity, item.priceAtSale, item.discount, item.tax);
      newItems[index] = item;
      return newItems;
    });
  };

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', quantity: 1, priceAtSale: 0, tax: 0, discount: 0, lineTotal: 0 },
    ]);
  };

  const deleteLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live Summary Calculation
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = subtotal - discount + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Please add at least one line item.');
      return;
    }

    const invalidItem = items.find((item) => !item.productId || item.quantity < 1 || item.priceAtSale < 0);
    if (invalidItem) {
      setErrorMsg('Please select a valid product and quantity (min 1) for all items.');
      return;
    }

    // Convert values back to Paise (integers)
    const payloadItems: CreateSaleItemPayload[] = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      tax: Math.round(item.tax * 100),
      discount: Math.round(item.discount * 100),
    }));

    const payload = {
      saleNumber: saleNumber.trim().toUpperCase(),
      customerId: customerId || undefined,
      saleDate: saleDate || undefined,
      discount: Math.round(discount * 100),
      tax: Math.round(tax * 100),
      notes: notes.trim() || undefined,
      items: payloadItems,
    };

    try {
      if (isEdit && id) {
        await updateSale({ id, body: payload }).unwrap();
      } else {
        await createSale(payload).unwrap();
      }
      navigate('/sales');
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to save sales invoice. Please verify inputs.');
    }
  };

  const isSaving = isCreating || isUpdating;
  const isLoading = customersLoading || productsLoading || (isEdit && saleLoading);

  if (isEdit && loadError) {
    return (
      <Alert severity="error" className="rounded-2xl font-sans p-4">
        Failed to load sales invoice details. The record may not exist.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => navigate('/sales')}
            className="hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-xl"
          >
            <ArrowBackIcon className="h-5 w-5" />
          </IconButton>
          <div>
            <h1 className="text-xl font-black text-secondary font-heading leading-tight">
              {isEdit ? 'Edit Sales Draft' : 'Create Sales Invoice'}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {isEdit ? `Modifying draft transaction ${saleNumber}` : 'Draft new customer invoice checkout log'}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <CircularProgress className="text-slate-900" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <Alert severity="error" className="rounded-2xl font-sans">
              {errorMsg}
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Header fields Column */}
            <div className="lg:col-span-2 space-y-6">
              <AppCard className="space-y-4">
                <Typography variant="subtitle2" className="!font-heading !font-black !text-secondary select-none">
                  Billing Information
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Sale Invoice No *"
                    placeholder="e.g. SALE-12345"
                    value={saleNumber}
                    onChange={(e) => setSaleNumber(e.target.value)}
                    required
                    disabled={isSaving}
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                      Associated Customer
                    </label>
                    <Select
                      value={customerId}
                      onChange={(e: SelectChangeEvent<string>) => setCustomerId(e.target.value)}
                      displayEmpty
                      disabled={isSaving}
                      className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
                      classes={{ select: '!py-2.5 !px-3.5' }}
                    >
                      <MenuItem value="" className="!text-sm italic text-slate-500">
                        Walk-in Customer (Guest)
                      </MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id} className="!text-sm">
                          {c.customerName} ({c.customerCode})
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <FormInput
                    label="Sale Date"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                    Transaction Remarks
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400 transition-all duration-200 min-h-[60px]"
                    placeholder="Reference logs, shipping terms, or credit details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </AppCard>

              {/* Items Grid appCard */}
              <AppCard className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <Typography variant="subtitle2" className="!font-heading !font-black !text-secondary">
                    Invoice Items
                  </Typography>
                  <Button
                    onClick={addLineItem}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans hover:bg-slate-50"
                    disabled={isSaving}
                  >
                    Add Product Line
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 select-none">
                        <th className="py-3 px-2 text-left text-[11px] font-bold text-slate-400 uppercase font-sans">Product *</th>
                        <th className="py-3 px-2 text-left text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Qty *</th>
                        <th className="py-3 px-2 text-left text-[11px] font-bold text-slate-400 uppercase font-sans w-32">Rate (₹)</th>
                        <th className="py-3 px-2 text-left text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Tax (₹)</th>
                        <th className="py-3 px-2 text-left text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Disc (₹)</th>
                        <th className="py-3 px-2 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-28">Total</th>
                        <th className="py-3 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => {
                        const activeProduct = products.find((p) => p.id === item.productId);
                        const unitName = activeProduct ? (activeProduct as any).unit?.name || 'Units' : 'Qty';

                        return (
                          <tr key={index} className="hover:bg-slate-50/20">
                            {/* Product Autocomplete Selection */}
                            <td className="py-2.5 px-2">
                              <Autocomplete
                                options={products}
                                getOptionLabel={(p) => `${p.name} (${p.sku})`}
                                value={products.find((p) => p.id === item.productId) || null}
                                onChange={(_, newVal) => {
                                  handleLineItemChange(index, 'productId', newVal ? newVal.id : '');
                                }}
                                disabled={isSaving}
                                size="small"
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Search product SKU/name..."
                                    className="!bg-slate-50 !rounded-xl"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '& fieldset': { borderColor: '#e2e8f0' },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </td>

                            {/* Quantity */}
                            <td className="py-2.5 px-2">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                                }
                                disabled={isSaving}
                                slotProps={{
                                  input: {
                                    endAdornment: <span className="text-[10px] text-slate-400 shrink-0 select-none ml-1">{unitName}</span>
                                  }
                                }}
                                className="!bg-slate-50 !rounded-xl"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#e2e8f0' } } }}
                              />
                            </td>

                            {/* Selling Price - READ ONLY to preserve sellingPrice contract */}
                            <td className="py-2.5 px-2 select-none">
                              <TextField
                                type="number"
                                size="small"
                                value={item.priceAtSale || ''}
                                disabled
                                slotProps={{
                                  input: {
                                    readOnly: true,
                                  }
                                }}
                                className="!bg-slate-100 !rounded-xl text-slate-500 font-semibold"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#e2e8f0' } } }}
                              />
                            </td>

                            {/* Tax */}
                            <td className="py-2.5 px-2">
                              <TextField
                                type="number"
                                size="small"
                                value={item.tax || ''}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'tax', Math.max(0, parseFloat(e.target.value) || 0))
                                }
                                disabled={isSaving}
                                className="!bg-slate-50 !rounded-xl"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#e2e8f0' } } }}
                              />
                            </td>

                            {/* Discount */}
                            <td className="py-2.5 px-2">
                              <TextField
                                type="number"
                                size="small"
                                value={item.discount || ''}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'discount', Math.max(0, parseFloat(e.target.value) || 0))
                                }
                                disabled={isSaving}
                                className="!bg-slate-50 !rounded-xl"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#e2e8f0' } } }}
                              />
                            </td>

                            {/* Line Total */}
                            <td className="py-2.5 px-2 text-right">
                              <span className="text-sm font-bold text-slate-700 font-sans">
                                ₹{item.lineTotal.toFixed(2)}
                              </span>
                            </td>

                            {/* Delete Button */}
                            <td className="py-2.5 px-2 text-center select-none">
                              <Tooltip title="Remove Product Line">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteLineItem(index)}
                                    disabled={isSaving || items.length === 1}
                                    className="text-rose-500 hover:bg-rose-50 disabled:text-slate-300 disabled:bg-transparent"
                                  >
                                    <DeleteIcon className="h-4.5 w-4.5" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </AppCard>
            </div>

            {/* Calculations & Summary pane Column */}
            <div className="space-y-6">
              <AppCard className="space-y-4">
                <Typography variant="subtitle2" className="!font-heading !font-black !text-secondary select-none">
                  Summary & Grand Total
                </Typography>

                <div className="space-y-3 font-sans text-sm select-none">
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-3 pt-2">
                    <FormInput
                      label="Header Discount (₹)"
                      type="number"
                      placeholder="0.00"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      disabled={isSaving}
                    />

                    <FormInput
                      label="Header Tax (₹)"
                      type="number"
                      placeholder="0.00"
                      value={tax || ''}
                      onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                      disabled={isSaving}
                    />
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex justify-between items-center py-2 text-secondary">
                    <span className="font-extrabold text-base">Grand Total</span>
                    <span className="font-black text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    variant="contained"
                    disableElevation
                    fullWidth
                    startIcon={<SaveIcon />}
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-sm font-bold min-h-[46px]"
                    disabled={isSaving}
                  >
                    {isSaving ? <CircularProgress size={20} className="text-white" /> : 'Save Sale Draft'}
                  </Button>

                  <Button
                    onClick={() => navigate('/sales')}
                    variant="outlined"
                    fullWidth
                    className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans text-sm font-semibold min-h-[44px] hover:bg-slate-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </AppCard>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default SaleFormScreen;

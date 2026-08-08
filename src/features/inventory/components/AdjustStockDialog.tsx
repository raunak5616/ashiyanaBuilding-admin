import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdjustStockMutation } from '../inventoryApi';

const adjustStockSchema = z.object({
  type: z.enum(['increase', 'decrease']),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1 unit'),
  reason: z
    .string()
    .min(4, 'Reason must be at least 4 characters long')
    .max(250, 'Reason cannot exceed 250 characters'),
});

type AdjustStockFormData = z.infer<typeof adjustStockSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
}

export default function AdjustStockDialog({
  open,
  onClose,
  productId,
  productName,
  productSku,
  currentStock,
}: AdjustStockDialogProps) {
  const [adjustStock, { isLoading, error }] = useAdjustStockMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      type: 'increase',
      quantity: 1,
      reason: '',
    },
  });

  const onSubmit = async (data: AdjustStockFormData) => {
    try {
      // Negate the quantity if it's a decrease
      const quantityChange = data.type === 'increase' ? data.quantity : -data.quantity;
      await adjustStock({ productId, quantityChange, reason: data.reason }).unwrap();
      reset();
      onClose();
    } catch {
      // Handled by mutation error state
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const backendError = error as { data?: { message?: string } } | undefined;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-sans font-bold border-b border-slate-100 pb-4">
        Manual Stock Adjustment
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4 py-6 font-sans">
          <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100 select-none">
            <div className="space-y-0.5">
              <p className="text-slate-500 font-semibold text-xs">Product Details</p>
              <p className="text-slate-800 font-bold text-sm">{productName}</p>
              <p className="text-slate-400 font-semibold text-xs">SKU: {productSku}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-semibold text-xs">Current Stock</p>
              <p className="text-slate-900 font-black text-lg">{currentStock} units</p>
            </div>
          </div>

          {backendError?.data?.message && (
            <Alert severity="error" className="rounded-xl font-sans">
              {backendError.data.message}
            </Alert>
          )}

          {/* Adjustment Type Radio */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans mt-2">
              Adjustment Type
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} row className="font-sans">
                  <FormControlLabel
                    value="increase"
                    control={<Radio size="small" className="text-slate-600 checked:text-slate-900" />}
                    label={<span className="text-sm font-semibold text-slate-700">Add Stock (+)</span>}
                  />
                  <FormControlLabel
                    value="decrease"
                    control={<Radio size="small" className="text-slate-600 checked:text-slate-900" />}
                    label={<span className="text-sm font-semibold text-slate-700">Remove Stock (-)</span>}
                  />
                </RadioGroup>
              )}
            />
          </div>

          {/* Adjustment Quantity */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans mt-1">
              Quantity Change (Units)
            </label>
            <TextField
              type="number"
              placeholder="e.g. 10"
              size="small"
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              disabled={isLoading}
              className="bg-white"
              {...register('quantity', { valueAsNumber: true })}
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans mt-2">
              Reason for Adjustment
            </label>
            <TextField
              multiline
              rows={3}
              placeholder="Provide a reason (e.g. Damaged items write-off, manual inventory count correction...)"
              size="small"
              error={!!errors.reason}
              helperText={errors.reason?.message}
              disabled={isLoading}
              className="bg-white"
              {...register('reason')}
            />
          </div>
        </DialogContent>

        <DialogActions className="border-t border-slate-100 p-4 gap-2">
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outlined"
            className="rounded-xl text-slate-600 border-slate-200 capitalize font-sans hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            disableElevation
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans min-w-[120px]"
          >
            {isLoading ? <CircularProgress size={20} className="text-white" /> : 'Adjust Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

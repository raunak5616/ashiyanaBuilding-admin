import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSetOpeningStockMutation } from '../inventoryApi';

const openingStockSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
});

type OpeningStockFormData = z.infer<typeof openingStockSchema>;

interface OpeningStockDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSku: string;
}

export default function OpeningStockDialog({
  open,
  onClose,
  productId,
  productName,
  productSku,
}: OpeningStockDialogProps) {
  const [setOpeningStock, { isLoading, error }] = useSetOpeningStockMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpeningStockFormData>({
    resolver: zodResolver(openingStockSchema),
    defaultValues: {
      quantity: 0,
    },
  });

  const onSubmit = async (data: OpeningStockFormData) => {
    try {
      await setOpeningStock({ productId, quantity: data.quantity }).unwrap();
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
        Set Opening Stock
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4 py-6 font-sans">
          <div className="bg-slate-50 p-4 rounded-xl space-y-1 text-sm border border-slate-100 select-none">
            <p className="text-slate-500 font-semibold">Product Name</p>
            <p className="text-slate-800 font-bold">{productName}</p>
            <p className="text-slate-400 font-semibold text-xs mt-1">SKU: {productSku}</p>
          </div>

          {backendError?.data?.message && (
            <Alert severity="error" className="rounded-xl font-sans">
              {backendError.data.message}
            </Alert>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans mt-2">
              Initial Stock Count (Units)
            </label>
            <TextField
              type="number"
              placeholder="e.g. 50"
              size="small"
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              disabled={isLoading}
              className="bg-white"
              {...register('quantity', { valueAsNumber: true })}
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
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans min-w-[90px]"
          >
            {isLoading ? <CircularProgress size={20} className="text-white" /> : 'Set Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useGetInventoryHistoryQuery } from '../inventoryApi';

interface InventoryHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSku: string;
}

export default function InventoryHistoryDialog({
  open,
  onClose,
  productId,
  productName,
  productSku,
}: InventoryHistoryDialogProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const { data, isLoading, error } = useGetInventoryHistoryQuery(
    {
      productId,
      page: page + 1,
      limit: rowsPerPage,
    },
    { skip: !open }
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const getMovementTypeDetails = (type: string, change: number) => {
    switch (type) {
      case 'opening':
        return { label: 'Opening Stock', color: 'primary' as const, bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'adjustment_increase':
        return { label: 'Manual Addition', color: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'adjustment_decrease':
        return { label: 'Manual Reduction', color: 'error' as const, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return change > 0
          ? { label: type.replace('_', ' '), color: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
          : { label: type.replace('_', ' '), color: 'error' as const, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-sans font-bold border-b border-slate-100 pb-4">
        Stock Movement History
      </DialogTitle>

      <DialogContent className="py-6 font-sans space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100 select-none">
          <div className="space-y-0.5">
            <p className="text-slate-500 font-semibold text-xs">Product Details</p>
            <p className="text-slate-800 font-bold text-sm">{productName}</p>
            <p className="text-slate-400 font-semibold text-xs">SKU: {productSku}</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <CircularProgress size={40} className="text-slate-900" />
          </div>
        )}

        {error && (
          <Alert severity="error" className="rounded-xl font-sans">
            Failed to fetch stock movement log. Please try again.
          </Alert>
        )}

        {!isLoading && !error && data && (
          <Paper elevation={0} className="border border-slate-200/80 rounded-xl overflow-hidden">
            <TableContainer>
              <Table size="small">
                <TableHead className="bg-slate-50/50">
                  <TableRow>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3">Date & Time</TableCell>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3">Type</TableCell>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3 align-middle text-right">Adjustment</TableCell>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3 align-middle text-right">Balance</TableCell>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3">Reason</TableCell>
                    <TableCell className="font-sans font-bold text-slate-500 text-xs py-3">User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className="py-8 font-sans text-slate-400 font-semibold">
                        No movement records found for this product.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((entry) => {
                      const typeDetails = getMovementTypeDetails(entry.type, entry.quantityChange);
                      return (
                        <TableRow key={entry.id} className="hover:bg-slate-50/30">
                          <TableCell className="font-sans text-xs text-slate-700 py-3">
                            {formatDate(entry.createdAt)}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase rounded-full ${typeDetails.bg}`}>
                              {typeDetails.label}
                            </span>
                          </TableCell>
                          <TableCell className="font-sans text-xs font-bold text-right py-3">
                            <span className={entry.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                            </span>
                          </TableCell>
                          <TableCell className="font-sans text-xs font-semibold text-slate-800 text-right py-3">
                            {entry.balanceAfter}
                          </TableCell>
                          <TableCell className="font-sans text-xs text-slate-500 py-3">
                            {entry.reason || <span className="text-slate-300">—</span>}
                          </TableCell>
                          <TableCell className="font-sans text-xs text-slate-600 py-3">
                            <div>
                              <p className="font-bold">{entry.actor.fullName}</p>
                              <p className="text-[10px] text-slate-400">{entry.actor.email}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {data.total > 0 && (
              <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={data.total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                className="border-t border-slate-100 text-xs font-sans text-slate-500"
              />
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions className="border-t border-slate-100 p-4">
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans min-w-[90px]"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

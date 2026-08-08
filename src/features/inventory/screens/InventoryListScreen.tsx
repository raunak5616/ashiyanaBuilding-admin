import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import { useGetInventoryListQuery } from '../inventoryApi';
import OpeningStockDialog from '../components/OpeningStockDialog';
import AdjustStockDialog from '../components/AdjustStockDialog';
import InventoryHistoryDialog from '../components/InventoryHistoryDialog';
import {
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetUnitsQuery,
} from '../../products/productApi';

export default function InventoryListScreen() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Fetch product lookup details
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: unitsData } = useGetUnitsQuery();

  const categoryMap = new Map(categoriesData?.data?.map((c) => [c.id, c.name]) || []);
  const brandMap = new Map(brandsData?.data?.map((b) => [b.id, b.name]) || []);
  const unitMap = new Map(unitsData?.data?.map((u) => [u.id, u.abbreviation || u.name]) || []);

  // Dialog management
  const [dialogState, setDialogState] = useState<{
    type: 'opening' | 'adjust' | 'history' | null;
    productId: string;
    productName: string;
    productSku: string;
    currentStock: number;
  }>({
    type: null,
    productId: '',
    productName: '',
    productSku: '',
    currentStock: 0,
  });

  const { data, isLoading, isFetching, error, refetch } = useGetInventoryListQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    lowStockOnly: lowStockOnly || undefined,
    isActive: isActive ? true : undefined,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDialog = (
    type: 'opening' | 'adjust' | 'history',
    productId: string,
    productName: string,
    productSku: string,
    currentStock: number
  ) => {
    setDialogState({
      type,
      productId,
      productName,
      productSku,
      currentStock,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, type: null }));
  };

  const getStockStatus = (current: number, min: number, isInitialized: boolean) => {
    if (!isInitialized) {
      return {
        label: 'Not Tracked',
        bg: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    }
    if (current <= 0) {
      return {
        label: 'Out of Stock',
        bg: 'bg-rose-50 text-rose-700 border-rose-100',
      };
    }
    if (current <= min) {
      return {
        label: 'Low Stock',
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
      };
    }
    return {
      label: 'In Stock',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return <span className="text-slate-300">—</span>;
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 font-sans p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm select-none">
        <div className="space-y-1">
          <Typography variant="h5" className="font-sans font-black text-slate-900 tracking-tight">
            Stock Inventory
          </Typography>
          <Typography variant="body2" className="font-sans text-slate-500 font-semibold">
            Track product stock counts, manage manual adjustments, and audit ledger history records.
          </Typography>
        </div>
        <Button
          onClick={refetch}
          disabled={isLoading || isFetching}
          variant="outlined"
          startIcon={<RefreshIcon />}
          className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans hover:bg-slate-50 min-h-[42px]"
        >
          {isFetching ? <CircularProgress size={18} className="text-slate-400" /> : 'Refresh'}
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <TextField
          placeholder="Search by Product Name or SKU..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full md:max-w-xs font-sans"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400 w-[18px] h-[18px]" />
                </InputAdornment>
              ),
            },
          }}
        />

        <div className="flex gap-4 w-full md:w-auto items-center justify-start select-none">
          <FormControlLabel
            control={
              <Checkbox
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setPage(0);
                }}
                className="text-slate-300 checked:text-slate-900"
              />
            }
            label={<span className="text-sm font-semibold text-slate-700">Low Stock Only</span>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => {
                  setIsActive(e.target.checked);
                  setPage(0);
                }}
                className="text-slate-300 checked:text-slate-900"
              />
            }
            label={<span className="text-sm font-semibold text-slate-700">Active Products Only</span>}
          />
        </div>
      </div>

      {/* Main Table */}
      {error && (
        <Alert severity="error" className="rounded-2xl font-sans">
          Failed to load inventory list. Please try again.
        </Alert>
      )}

      {!error && (
        <Paper elevation={0} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <TableContainer className="max-h-[60vh]">
            <Table stickyHeader size="small">
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4 px-6">Product</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4">Category / Brand</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4 text-center">Minimum Threshold</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4 text-center">Current Stock</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4">Status</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4">Last Movement</TableCell>
                  <TableCell className="font-sans font-bold text-slate-500 text-xs py-4 text-center px-6">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-20">
                      <CircularProgress size={40} className="text-slate-900" />
                    </TableCell>
                  </TableRow>
                ) : !data || data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-16 font-sans text-slate-400 font-semibold">
                      No inventory items match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((item) => {
                    const isInitialized = item.lastMovementAt !== null || item.currentStock > 0;
                    const status = getStockStatus(item.currentStock, item.minimumStock, isInitialized);
                    const hasImage = item.images && item.images.length > 0;
                    const imageUrl = hasImage ? item.images[0].url : '';
                    
                    const categoryName = item.categoryId ? categoryMap.get(item.categoryId) || 'Uncategorized' : 'Uncategorized';
                    const brandName = item.brandId ? brandMap.get(item.brandId) || 'Generic' : 'Generic';
                    const unitName = item.unitId ? unitMap.get(item.unitId) || 'Units' : 'Units';

                    return (
                      <TableRow key={item.productId} className="hover:bg-slate-50/30">
                        {/* Product Detail Thumbnail/Name */}
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center select-none flex-shrink-0">
                              {hasImage ? (
                                <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  {item.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-sans font-bold text-slate-800 text-sm leading-tight">
                                {item.name}
                              </p>
                              <p className="font-sans text-[11px] font-semibold text-slate-400 tracking-wider">
                                SKU: {item.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category & Brand */}
                        <TableCell className="py-4">
                          <div className="space-y-0.5 text-xs">
                            <p className="font-bold text-slate-700">{categoryName}</p>
                            <p className="text-slate-400 font-semibold">{brandName}</p>
                          </div>
                        </TableCell>

                        {/* Min Threshold */}
                        <TableCell className="font-sans text-sm font-bold text-slate-700 text-center py-4">
                          {item.minimumStock} <span className="text-xs font-medium text-slate-400">{unitName}</span>
                        </TableCell>

                        {/* Current Stock */}
                        <TableCell className="font-sans text-sm font-black text-slate-900 text-center py-4">
                          {isInitialized ? item.currentStock : <span className="text-slate-300 font-normal">Not Set</span>}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            {isInitialized ? unitName : ''}
                          </span>
                        </TableCell>

                        {/* Status Chip */}
                        <TableCell className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${status.bg}`}>
                            {status.label}
                          </span>
                        </TableCell>

                        {/* Last Movement */}
                        <TableCell className="font-sans text-xs text-slate-500 py-4">
                          {formatDate(item.lastMovementAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4 text-center px-6">
                          <div className="flex gap-2 justify-center items-center">
                            {!isInitialized ? (
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                variant="contained"
                                disableElevation
                                onClick={() =>
                                  openDialog(
                                    'opening',
                                    item.productId,
                                    item.name,
                                    item.sku,
                                    0
                                  )
                                }
                                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-3 min-h-[32px]"
                              >
                                Set Stock
                              </Button>
                            ) : (
                              <>
                                <Tooltip title="Adjust Stock">
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      openDialog(
                                        'adjust',
                                        item.productId,
                                        item.name,
                                        item.sku,
                                        item.currentStock
                                      )
                                    }
                                    variant="outlined"
                                    className="min-w-0 w-8 h-8 rounded-lg border-slate-200 text-slate-600 p-0 hover:bg-slate-50"
                                  >
                                    <TuneIcon className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip title="View Stock Ledger History">
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      openDialog(
                                        'history',
                                        item.productId,
                                        item.name,
                                        item.sku,
                                        item.currentStock
                                      )
                                    }
                                    variant="outlined"
                                    className="min-w-0 w-8 h-8 rounded-lg border-slate-200 text-slate-600 p-0 hover:bg-slate-50"
                                  >
                                    <HistoryIcon className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </>
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

          {data && data.total > 0 && (
            <TablePagination
              component="div"
              count={data.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              className="border-t border-slate-100 text-xs font-sans text-slate-500"
            />
          )}
        </Paper>
      )}

      {/* Modal Dialog Managers */}
      {dialogState.type === 'opening' && (
        <OpeningStockDialog
          open={dialogState.type === 'opening'}
          onClose={closeDialog}
          productId={dialogState.productId}
          productName={dialogState.productName}
          productSku={dialogState.productSku}
        />
      )}

      {dialogState.type === 'adjust' && (
        <AdjustStockDialog
          open={dialogState.type === 'adjust'}
          onClose={closeDialog}
          productId={dialogState.productId}
          productName={dialogState.productName}
          productSku={dialogState.productSku}
          currentStock={dialogState.currentStock}
        />
      )}

      {dialogState.type === 'history' && (
        <InventoryHistoryDialog
          open={dialogState.type === 'history'}
          onClose={closeDialog}
          productId={dialogState.productId}
          productName={dialogState.productName}
          productSku={dialogState.productSku}
        />
      )}
    </div>
  );
}

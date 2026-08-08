import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// MUI Icons
import PointOfSaleIcon from '@mui/icons-material/PointOfSaleOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';

import AppCard from '@/components/common/AppCard';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import SearchToolbar from '@/components/common/SearchToolbar';
import LoadingOverlay from '@/components/common/LoadingOverlay';

import { useGetSalesQuery, Sale } from '../salesApi';
import { useGetCustomersQuery } from '../../customers/customerApi';

export const SaleListScreen: React.FC = () => {
  const navigate = useNavigate();

  // State for Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dropdown Menu Anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuSale, setActiveMenuSale] = useState<Sale | null>(null);

  // API Queries
  const { data: customersResponse } = useGetCustomersQuery(undefined);
  const { data: salesResponse, isLoading, isFetching, refetch } = useGetSalesQuery({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    customerId: customerFilter === 'all' ? undefined : customerFilter,
    page,
    limit,
  });

  const customers = customersResponse?.data || [];
  const sales = salesResponse?.data || [];
  const totalItems = salesResponse?.metadata?.total || 0;

  // Build customer lookup map
  const customerMap = new Map(customers.map((c) => [c.id, c.customerName]));

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, sale: Sale) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuSale(sale);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuSale(null);
  };

  const triggerView = () => {
    if (activeMenuSale) {
      navigate(`/sales/${activeMenuSale.id}`);
    }
    handleCloseMenu();
  };

  const triggerEdit = () => {
    if (activeMenuSale) {
      navigate(`/sales/${activeMenuSale.id}/edit`);
    }
    handleCloseMenu();
  };

  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const getStatusChipDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return { status: 'success' as const, label: 'Completed' };
      case 'cancelled':
        return { status: 'error' as const, label: 'Cancelled' };
      default:
        return { status: 'warning' as const, label: 'Draft' };
    }
  };

  const columns: Column<Sale>[] = [
    {
      key: 'saleNumber',
      label: 'Sale No',
      render: (row: Sale) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/80 text-secondary font-black flex items-center justify-center shrink-0 select-none">
            <PointOfSaleIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{row.saleNumber}</p>
            <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
              Ref: {row.id.substring(row.id.length - 6).toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'saleDate',
      label: 'Date',
      render: (row: Sale) => (
        <span className="text-xs font-semibold text-slate-600 font-sans">
          {row.saleDate ? new Date(row.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer / Client',
      render: (row: Sale) => (
        <span className="text-xs font-bold text-slate-700">
          {row.customerId ? (customerMap.get(row.customerId) || 'Loading Customer...') : 'Walk-in Customer'}
        </span>
      ),
    },
    {
      key: 'grandTotal',
      label: 'Grand Total',
      render: (row: Sale) => (
        <span className="text-xs font-black text-slate-800 font-sans">
          {formatCurrency(row.grandTotal)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Sale) => {
        const details = getStatusChipDetails(row.status);
        return <StatusChip status={details.status} label={details.label} />;
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row: Sale) => (
        <div className="flex justify-end select-none">
          <IconButton
            size="small"
            onClick={(e) => handleOpenMenu(e, row)}
            className="hover:bg-slate-100 hover:text-slate-800 text-slate-400"
          >
            <MoreVertIcon className="h-5 w-5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <div>
          <h1 className="text-xl font-black text-secondary font-heading leading-tight">
            Sales Transactions
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            View history of all register sales and handle customer order checkout logs.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto items-center">
          <Button
            onClick={refetch}
            disabled={isLoading || isFetching}
            variant="outlined"
            startIcon={<RefreshIcon />}
            className="rounded-xl border-slate-200 text-slate-600 capitalize font-sans hover:bg-slate-50 min-h-[42px] shrink-0"
          >
            {isFetching ? <CircularProgress size={18} className="text-slate-400" /> : 'Refresh'}
          </Button>

          <Button
            onClick={() => navigate('/sales/new')}
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-4 min-h-[42px] w-full sm:w-auto shrink-0"
          >
            New Sale Invoice
          </Button>
        </div>
      </div>

      {/* Table Container appCard */}
      <AppCard>
        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-6 select-none">
          <div className="md:col-span-2">
            <SearchToolbar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by sale number or remarks..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              Status:
            </span>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              size="small"
              className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 w-full"
              classes={{ select: '!py-1.5 !px-3' }}
            >
              <MenuItem value="all" className="!text-xs !font-sans font-medium">All Status</MenuItem>
              <MenuItem value="draft" className="!text-xs !font-sans text-amber-600 font-semibold">Draft</MenuItem>
              <MenuItem value="completed" className="!text-xs !font-sans text-emerald-600 font-semibold">Completed</MenuItem>
              <MenuItem value="cancelled" className="!text-xs !font-sans text-rose-500 font-semibold">Cancelled</MenuItem>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              Customer:
            </span>
            <Select
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value);
                setPage(1);
              }}
              size="small"
              className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 w-full"
              classes={{ select: '!py-1.5 !px-3' }}
            >
              <MenuItem value="all" className="!text-xs !font-sans font-medium">All Customers</MenuItem>
              <MenuItem value="walk-in" className="!text-xs !font-sans italic">Walk-in Customers</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id} className="!text-xs !font-sans">
                  {c.customerName}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="relative">
          {isLoading && <LoadingOverlay message="Loading sales logs..." />}
          <DataTable
            columns={columns}
            data={sales}
            loading={isLoading}
            page={page - 1}
            limit={limit}
            total={totalItems}
            onPageChange={(val) => setPage(val + 1)}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            emptyMessage="No sales transactions found matching your selected criteria."
          />
        </div>
      </AppCard>

      {/* Actions dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            className: '!rounded-xl !shadow-xl border border-slate-100 !py-1 !min-w-[160px]',
          },
        }}
      >
        <MenuItem onClick={triggerView} className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50">
          <VisibilityIcon className="h-4 w-4 text-slate-400 shrink-0" />
          View Invoice Details
        </MenuItem>

        {activeMenuSale?.status === 'draft' && (
          <MenuItem onClick={triggerEdit} className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50">
            <EditIcon className="h-4 w-4 text-slate-400 shrink-0" />
            Edit Draft
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default SaleListScreen;

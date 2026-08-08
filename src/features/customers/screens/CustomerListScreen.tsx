import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// MUI Icons
import PersonIcon from '@mui/icons-material/PersonOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';

import AppCard from '@/components/common/AppCard';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchToolbar from '@/components/common/SearchToolbar';
import LoadingOverlay from '@/components/common/LoadingOverlay';

import {
  useGetCustomersQuery,
  useArchiveCustomerMutation,
  useRestoreCustomerMutation,
  Customer,
} from '../customerApi';

import CustomerFormDialog from '../components/CustomerFormDialog';

export const CustomerListScreen: React.FC = () => {
  // State for Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Archive/Restore Confirmation States
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [customerToAction, setCustomerToAction] = useState<Customer | null>(null);

  // Dropdown Menu Anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuCustomer, setActiveMenuCustomer] = useState<Customer | null>(null);

  // API Queries & Mutations
  const { data: customersResponse, isLoading, isFetching, refetch } = useGetCustomersQuery({
    search: search.trim() || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    customerType: typeFilter === 'all' ? undefined : typeFilter,
    page,
    limit,
  });

  const [archiveCustomer, { isLoading: isArchiving }] = useArchiveCustomerMutation();
  const [restoreCustomer, { isLoading: isRestoring }] = useRestoreCustomerMutation();

  const customers = customersResponse?.data || [];
  const totalItems = customersResponse?.metadata?.total || 0;

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, customer: Customer) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuCustomer(customer);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuCustomer(null);
  };

  const triggerEdit = () => {
    if (activeMenuCustomer) {
      setSelectedCustomer(activeMenuCustomer);
      setFormOpen(true);
    }
    handleCloseMenu();
  };

  const triggerArchiveConfirm = () => {
    if (activeMenuCustomer) {
      setCustomerToAction(activeMenuCustomer);
      setArchiveConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const triggerRestoreConfirm = () => {
    if (activeMenuCustomer) {
      setCustomerToAction(activeMenuCustomer);
      setRestoreConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const handleArchive = async () => {
    if (customerToAction) {
      try {
        await archiveCustomer(customerToAction.id).unwrap();
      } catch (err) {
        console.error('Failed to archive customer:', err);
      } finally {
        setArchiveConfirmOpen(false);
        setCustomerToAction(null);
      }
    }
  };

  const handleRestore = async () => {
    if (customerToAction) {
      try {
        await restoreCustomer(customerToAction.id).unwrap();
      } catch (err) {
        console.error('Failed to restore customer:', err);
      } finally {
        setRestoreConfirmOpen(false);
        setCustomerToAction(null);
      }
    }
  };

  const formatCurrency = (amountInPaise?: number) => {
    if (amountInPaise === undefined || amountInPaise === null) return '₹0.00';
    return (amountInPaise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const columns: Column<Customer>[] = [
    {
      key: 'customerName',
      label: 'Customer Name',
      render: (row: Customer) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/80 text-secondary font-black flex items-center justify-center shrink-0 select-none">
            <PersonIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{row.customerName}</p>
            {row.customerType === 'business' && row.businessName && (
              <p className="text-xs text-slate-500 font-sans leading-tight mt-0.5">
                Trade: {row.businessName}
              </p>
            )}
            <p className="text-[10px] text-slate-400 font-semibold font-sans tracking-wider uppercase mt-0.5">
              Code: {row.customerCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'customerType',
      label: 'Type',
      render: (row: Customer) => (
        <span className={`text-xs font-bold uppercase tracking-wider ${row.customerType === 'business' ? 'text-blue-600' : 'text-slate-500'}`}>
          {row.customerType}
        </span>
      ),
    },
    {
      key: 'contactInfo',
      label: 'Contact Info',
      render: (row: Customer) => (
        <div className="space-y-0.5 text-xs font-sans text-slate-500">
          <p className="font-semibold text-slate-700">{row.phone || '—'}</p>
          {row.email && <p className="text-[10px] text-slate-400 lowercase">{row.email}</p>}
        </div>
      ),
    },
    {
      key: 'gstNumber',
      label: 'GSTIN / PAN',
      render: (row: Customer) => (
        <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
          <p>GST: <span className="font-bold">{row.gstNumber || '—'}</span></p>
          <p>PAN: <span className="font-bold">{row.panNumber || '—'}</span></p>
        </div>
      ),
    },
    {
      key: 'creditLimit',
      label: 'Credit Limit',
      render: (row: Customer) => (
        <span className="text-xs font-black text-slate-800 font-sans">
          {formatCurrency(row.creditLimit)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Customer) => (
        <StatusChip
          status={row.isActive ? 'success' : 'error'}
          label={row.isActive ? 'Active' : 'Archived'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row: Customer) => (
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
            Customer Directory
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Access store credit parameters, transaction logs, and customer profiles.
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
            onClick={() => {
              setSelectedCustomer(null);
              setFormOpen(true);
            }}
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-4 min-h-[42px] w-full sm:w-auto shrink-0"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <AppCard>
        {/* Filters Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6 select-none">
          <div className="flex-1 max-w-md">
            <SearchToolbar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by customer name, code or phone..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                Type:
              </span>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                size="small"
                className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-32"
                classes={{ select: '!py-1.5 !px-3' }}
              >
                <MenuItem value="all" className="!text-xs !font-sans font-medium">All Types</MenuItem>
                <MenuItem value="individual" className="!text-xs !font-sans font-semibold">Individual</MenuItem>
                <MenuItem value="business" className="!text-xs !font-sans font-semibold text-blue-600">Business</MenuItem>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                Status:
              </span>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                size="small"
                className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-32"
                classes={{ select: '!py-1.5 !px-3' }}
              >
                <MenuItem value="all" className="!text-xs !font-sans font-medium">All Status</MenuItem>
                <MenuItem value="active" className="!text-xs !font-sans text-emerald-600 font-semibold">Active Only</MenuItem>
                <MenuItem value="archived" className="!text-xs !font-sans text-rose-500 font-semibold">Archived Only</MenuItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="relative">
          {isLoading && <LoadingOverlay message="Loading customer profiles..." />}
          <DataTable
            columns={columns}
            data={customers}
            loading={isLoading}
            page={page - 1}
            limit={limit}
            total={totalItems}
            onPageChange={(val) => setPage(val + 1)}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            emptyMessage="No customer records match your filter criteria."
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
        <MenuItem onClick={triggerEdit} className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50">
          <EditIcon className="h-4 w-4 text-slate-400 shrink-0" />
          Edit Profile
        </MenuItem>

        <div className="my-1 border-t border-slate-100"></div>

        {activeMenuCustomer?.isActive ? (
          <MenuItem
            onClick={triggerArchiveConfirm}
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-rose-600 hover:!bg-rose-50/50"
          >
            <BlockIcon className="h-4 w-4 text-rose-400 shrink-0" />
            Archive Customer
          </MenuItem>
        ) : (
          <MenuItem
            onClick={triggerRestoreConfirm}
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-emerald-600 hover:!bg-emerald-50/50"
          >
            <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
            Restore Customer
          </MenuItem>
        )}
      </Menu>

      {/* Modals & Dialogs */}
      {formOpen && (
        <CustomerFormDialog
          open={formOpen}
          customer={selectedCustomer}
          onClose={() => {
            setFormOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Archive Confirm */}
      {archiveConfirmOpen && customerToAction && (
        <ConfirmDialog
          open={archiveConfirmOpen}
          title="Archive Customer Profile?"
          message={`Are you sure you want to archive "${customerToAction.customerName}"? Archived customer records cannot be associated with new invoices, but historical records will remain intact.`}
          confirmText="Archive"
          onConfirm={handleArchive}
          onClose={() => {
            setArchiveConfirmOpen(false);
            setCustomerToAction(null);
          }}
          loading={isArchiving}
        />
      )}

      {/* Restore Confirm */}
      {restoreConfirmOpen && customerToAction && (
        <ConfirmDialog
          open={restoreConfirmOpen}
          title="Restore Customer Profile?"
          message={`Are you sure you want to restore "${customerToAction.customerName}"? This will allow creating new register invoices for this customer immediately.`}
          confirmText="Restore"
          onConfirm={handleRestore}
          onClose={() => {
            setRestoreConfirmOpen(false);
            setCustomerToAction(null);
          }}
          loading={isRestoring}
        />
      )}
    </div>
  );
};

export default CustomerListScreen;

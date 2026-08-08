import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// MUI Icons
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
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
  useGetSuppliersQuery,
  useArchiveSupplierMutation,
  useRestoreSupplierMutation,
  Supplier,
} from '../supplierApi';

import SupplierFormDialog from '../components/SupplierFormDialog';

export const SupplierListScreen: React.FC = () => {
  // State for Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Archive/Restore Confirmation States
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [supplierToAction, setSupplierToAction] = useState<Supplier | null>(null);

  // Dropdown Menu Anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuSupplier, setActiveMenuSupplier] = useState<Supplier | null>(null);

  // API Queries & Mutations
  const { data: suppliersResponse, isLoading, isFetching, refetch } = useGetSuppliersQuery({
    search: search.trim() || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    limit,
  });

  const [archiveSupplier, { isLoading: isArchiving }] = useArchiveSupplierMutation();
  const [restoreSupplier, { isLoading: isRestoring }] = useRestoreSupplierMutation();

  const suppliers = suppliersResponse?.data || [];
  const totalItems = suppliersResponse?.metadata?.total || 0;

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuSupplier(supplier);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuSupplier(null);
  };

  const triggerEdit = () => {
    if (activeMenuSupplier) {
      setSelectedSupplier(activeMenuSupplier);
      setFormOpen(true);
    }
    handleCloseMenu();
  };

  const triggerArchiveConfirm = () => {
    if (activeMenuSupplier) {
      setSupplierToAction(activeMenuSupplier);
      setArchiveConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const triggerRestoreConfirm = () => {
    if (activeMenuSupplier) {
      setSupplierToAction(activeMenuSupplier);
      setRestoreConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const handleArchive = async () => {
    if (supplierToAction) {
      try {
        await archiveSupplier(supplierToAction.id).unwrap();
      } catch (err) {
        console.error('Failed to archive supplier:', err);
      } finally {
        setArchiveConfirmOpen(false);
        setSupplierToAction(null);
      }
    }
  };

  const handleRestore = async () => {
    if (supplierToAction) {
      try {
        await restoreSupplier(supplierToAction.id).unwrap();
      } catch (err) {
        console.error('Failed to restore supplier:', err);
      } finally {
        setRestoreConfirmOpen(false);
        setSupplierToAction(null);
      }
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'businessName',
      label: 'Supplier / Vendor',
      render: (row: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/80 text-secondary font-black flex items-center justify-center shrink-0 select-none">
            <StorefrontIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{row.businessName}</p>
            <p className="text-[11px] text-slate-400 font-semibold font-sans tracking-wider uppercase mt-0.5">
              Code: {row.supplierCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      render: (row: Supplier) => <span className="text-xs font-semibold text-slate-700">{row.contactPerson || '—'}</span>,
    },
    {
      key: 'contactInfo',
      label: 'Contact Info',
      render: (row: Supplier) => (
        <div className="space-y-0.5 text-xs font-sans text-slate-500">
          <p className="font-semibold text-slate-700">{row.phone || '—'}</p>
          {row.email && <p className="text-[10px] text-slate-400 lowercase">{row.email}</p>}
        </div>
      ),
    },
    {
      key: 'gstNumber',
      label: 'GSTIN / PAN',
      render: (row: Supplier) => (
        <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
          <p>GST: <span className="font-bold">{row.gstNumber || '—'}</span></p>
          <p>PAN: <span className="font-bold">{row.panNumber || '—'}</span></p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row: Supplier) => (
        <span className="text-xs font-semibold text-slate-600 font-sans">
          {row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Supplier) => (
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
      render: (row: Supplier) => (
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
            Supplier Directory
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Manage manufacturer profiles, active purchases, and outstanding supplier ledger details.
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
              setSelectedSupplier(null);
              setFormOpen(true);
            }}
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-4 min-h-[42px] w-full sm:w-auto shrink-0"
          >
            Add Supplier
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
              placeholder="Search by vendor name, code, contact or phone..."
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              Filter:
            </span>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              size="small"
              className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-36"
              classes={{ select: '!py-1.5 !px-3' }}
            >
              <MenuItem value="all" className="!text-xs !font-sans font-medium">All Status</MenuItem>
              <MenuItem value="active" className="!text-xs !font-sans text-emerald-600 font-semibold">Active Only</MenuItem>
              <MenuItem value="archived" className="!text-xs !font-sans text-rose-500 font-semibold">Archived Only</MenuItem>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="relative">
          {isLoading && <LoadingOverlay message="Loading supplier records..." />}
          <DataTable
            columns={columns}
            data={suppliers}
            loading={isLoading}
            page={page - 1}
            limit={limit}
            total={totalItems}
            onPageChange={(val) => setPage(val + 1)}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            emptyMessage="No supplier records match your search criteria."
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

        {activeMenuSupplier?.isActive ? (
          <MenuItem
            onClick={triggerArchiveConfirm}
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-rose-600 hover:!bg-rose-50/50"
          >
            <BlockIcon className="h-4 w-4 text-rose-400 shrink-0" />
            Archive Supplier
          </MenuItem>
        ) : (
          <MenuItem
            onClick={triggerRestoreConfirm}
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-emerald-600 hover:!bg-emerald-50/50"
          >
            <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
            Restore Supplier
          </MenuItem>
        )}
      </Menu>

      {/* Modals & Dialogs */}
      {formOpen && (
        <SupplierFormDialog
          open={formOpen}
          supplier={selectedSupplier}
          onClose={() => {
            setFormOpen(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Archive Confirm */}
      {archiveConfirmOpen && supplierToAction && (
        <ConfirmDialog
          open={archiveConfirmOpen}
          title="Archive Supplier Profile?"
          message={`Are you sure you want to archive "${supplierToAction.businessName}"? Archived suppliers cannot be attached to new purchase orders, but historical logs will remain intact.`}
          confirmText="Archive"
          onConfirm={handleArchive}
          onClose={() => {
            setArchiveConfirmOpen(false);
            setSupplierToAction(null);
          }}
          loading={isArchiving}
        />
      )}

      {/* Restore Confirm */}
      {restoreConfirmOpen && supplierToAction && (
        <ConfirmDialog
          open={restoreConfirmOpen}
          title="Restore Supplier Profile?"
          message={`Are you sure you want to restore "${supplierToAction.businessName}"? This will allow placing new purchase orders against this supplier immediately.`}
          confirmText="Restore"
          onConfirm={handleRestore}
          onClose={() => {
            setRestoreConfirmOpen(false);
            setSupplierToAction(null);
          }}
          loading={isRestoring}
        />
      )}
    </div>
  );
};

export default SupplierListScreen;

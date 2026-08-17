import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';

import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';

import AppCard from '@/components/common/AppCard';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import SearchToolbar from '@/components/common/SearchToolbar';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ExpenseFormDialog from '@/features/expenses/components/ExpenseFormDialog';
import ExpenseCategoryManagerDialog from '@/features/expenses/components/ExpenseCategoryManagerDialog';

import { useGetExpensesQuery, useGetExpenseCategoriesQuery, Expense, ExpenseCategory } from '@/features/expenses/expenseApi';

// Utility to format amount (paise) to Indian Rupees
const formatCurrency = (amountInPaise: number) => {
  const amountInRupees = amountInPaise / 100;
  return amountInRupees.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });
};

// Status chip helper (same as sales)
const getStatusChipDetails = (status: string) => {
  switch (status) {
    case 'paid':
      return { status: 'success' as const, label: 'Paid' };
    case 'pending':
      return { status: 'warning' as const, label: 'Pending' };
    default:
      return { status: 'default' as const, label: status };
  }
};

export const ExpenseListScreen: React.FC = () => {
  // Filters & pagination state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);

  // API queries
  const { data: categoriesResponse } = useGetExpenseCategoriesQuery(undefined);
  const categories = categoriesResponse?.data || [];
  const { data: expensesResponse, isLoading, isFetching, refetch } = useGetExpensesQuery({
    search: search.trim() || undefined,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    page,
    limit,
  });

  const expenses = expensesResponse?.data || [];
  const totalItems = expensesResponse?.metadata?.total || 0;

  // Build lookup map for category names
  const categoryMap = new Map(categories.map((c: ExpenseCategory) => [c.id, c.name]));

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setActiveExpense(expense);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveExpense(null);
  };

  const triggerEdit = () => {
    if (activeExpense) {
      setEditingExpense(activeExpense);
      setFormDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormDialogOpen(false);
    setEditingExpense(null);
  };

  const columns: Column<Expense>[] = [
    {
      key: 'expenseNumber',
      label: 'Expense #',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 select-none">
            <ReceiptLongIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{row.expenseNumber}</p>
            <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
              {row.title}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.expenseDate ? new Date(row.expenseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {categoryMap.get(row.categoryId) || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="text-xs font-bold text-slate-800">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (row) => (
        <span className="text-xs text-slate-600 capitalize">{row.paymentMethod || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const details = getStatusChipDetails(row.status);
        return <StatusChip status={details.status} label={details.label} />;
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end select-none">
          <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)} className="hover:bg-slate-100 text-slate-400">
            <MoreVertIcon className="h-5 w-5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-secondary">Expenses Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Manage shop operational expenses and view financial KPIs.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setCategoryDialogOpen(true)}
            variant="outlined"
            startIcon={<CategoryIcon />}
            className="rounded-xl border-slate-200 text-slate-600 capitalize hover:bg-slate-50 min-h-[42px] w-full sm:w-auto"
          >
            Categories
          </Button>
          <Button
            onClick={refetch}
            disabled={isLoading || isFetching}
            variant="outlined"
            startIcon={<RefreshIcon />}
            className="rounded-xl border-slate-200 text-slate-600 capitalize hover:bg-slate-50 min-h-[42px] w-full sm:w-auto"
          >
            {isFetching ? <CircularProgress size={18} className="text-slate-400" /> : 'Refresh'}
          </Button>
          <Button
            onClick={handleOpenAdd}
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize text-xs font-semibold px-4 min-h-[42px] w-full sm:w-auto"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <AppCard>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
          <SearchToolbar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by title or number..."
          />
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            size="small"
            className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 w-full"
            classes={{ select: '!py-1.5 !px-3' }}
          >
            <MenuItem value="all" className="!text-xs font-medium">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id} className="!text-xs font-medium">
                {c.name}
              </MenuItem>
            ))}
          </Select>
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
            <MenuItem value="all" className="!text-xs font-medium">All Status</MenuItem>
            <MenuItem value="pending" className="!text-xs text-amber-600 font-semibold">Pending</MenuItem>
            <MenuItem value="paid" className="!text-xs text-emerald-600 font-semibold">Paid</MenuItem>
          </Select>
        </div>
        {/* Data Table */}
        <div className="relative">
          {isLoading && <LoadingOverlay message="Loading expenses..." />}
          <DataTable
            columns={columns}
            data={expenses}
            loading={isLoading}
            page={page - 1}
            limit={limit}
            total={totalItems}
            onPageChange={(val) => setPage(val + 1)}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            emptyMessage="No expenses found matching your criteria."
          />
        </div>
      </AppCard>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} slotProps={{ paper: { className: '!rounded-xl !shadow-xl border border-slate-100 !py-1 !min-w-[160px]' } }}>
        <MenuItem onClick={triggerEdit} className="!text-xs !py-2 !gap-2.5 hover:!bg-slate-50">
          <EditIcon className="h-4 w-4 text-slate-400" /> Edit Expense
        </MenuItem>
      </Menu>

      {/* Add / Edit Expense Dialog */}
      <ExpenseFormDialog
        open={formDialogOpen}
        expense={editingExpense}
        onClose={handleCloseForm}
      />

      {/* Manage Categories Dialog */}
      <ExpenseCategoryManagerDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
      />
    </div>
  );
};

export default ExpenseListScreen;

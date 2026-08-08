import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/notificationsSlice';
import { useAuth } from '@/hooks/useAuth';
import AppCard from '@/components/common/AppCard';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import PrimaryButton from '@/components/common/PrimaryButton';
import ErrorPage from '@/components/common/ErrorPage';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchToolbar from '@/components/common/SearchToolbar';
import LoadingOverlay from '@/components/common/LoadingOverlay';

// Import MUI components & Icons
import PersonAddIcon from '@mui/icons-material/PersonAddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';

import {
  useGetStaffListQuery,
  useDeactivateStaffMutation,
  useReactivateStaffMutation,
  useGetRolesListQuery,
  StaffUser,
} from '../usersApi';

import StaffFormDialog from '../components/StaffFormDialog';
import ResetPasswordDialog from '../components/ResetPasswordDialog';
import ChangeRoleDialog from '../components/ChangeRoleDialog';

export const UserListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  
  // State for Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal / Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Deactivate / Reactivate Confirm states
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [staffToAction, setStaffToAction] = useState<StaffUser | null>(null);

  // Action Menu Anchor State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuStaff, setActiveMenuStaff] = useState<StaffUser | null>(null);

  // API Queries & Mutations
  const { data: rolesResponse } = useGetRolesListQuery();
  const { data: staffResponse, isLoading, isError, error } = useGetStaffListQuery({
    search: search.trim() || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    roleId: roleFilter === 'all' ? undefined : roleFilter,
    page,
    limit,
  });

  const [deactivateStaff, { isLoading: isDeactivating }] = useDeactivateStaffMutation();
  const [reactivateStaff, { isLoading: isReactivating }] = useReactivateStaffMutation();

  const roles = rolesResponse?.data || [];
  const staffMembers = staffResponse?.data || [];
  const totalItems = staffResponse?.metadata?.total || 0;

  // Handle action menu opening
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, staff: StaffUser) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuStaff(staff);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuStaff(null);
  };

  const triggerEdit = () => {
    if (activeMenuStaff) {
      setSelectedStaff(activeMenuStaff);
      setFormOpen(true);
    }
    handleCloseMenu();
  };

  const triggerPasswordReset = () => {
    if (activeMenuStaff) {
      setSelectedStaff(activeMenuStaff);
      setPasswordOpen(true);
    }
    handleCloseMenu();
  };

  const triggerChangeRole = () => {
    if (activeMenuStaff) {
      setSelectedStaff(activeMenuStaff);
      setRoleOpen(true);
    }
    handleCloseMenu();
  };

  const triggerDeactivateConfirm = () => {
    if (activeMenuStaff) {
      setStaffToAction(activeMenuStaff);
      setDeactivateConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const triggerReactivateConfirm = () => {
    if (activeMenuStaff) {
      setStaffToAction(activeMenuStaff);
      setReactivateConfirmOpen(true);
    }
    handleCloseMenu();
  };

  const handleDeactivate = async () => {
    if (staffToAction) {
      try {
        await deactivateStaff(staffToAction.id).unwrap();
        dispatch(
          addNotification({
            title: 'Staff Account Deactivated',
            message: `Account for ${staffToAction.fullName} has been deactivated.`,
            type: 'warning',
          })
        );
      } catch (err) {
        console.error('Failed to deactivate staff member:', err);
      } finally {
        setDeactivateConfirmOpen(false);
        setStaffToAction(null);
      }
    }
  };

  const handleReactivate = async () => {
    if (staffToAction) {
      try {
        await reactivateStaff(staffToAction.id).unwrap();
        dispatch(
          addNotification({
            title: 'Staff Account Reactivated',
            message: `Account for ${staffToAction.fullName} has been reactivated.`,
            type: 'success',
          })
        );
      } catch (err) {
        console.error('Failed to reactivate staff member:', err);
      } finally {
        setReactivateConfirmOpen(false);
        setStaffToAction(null);
      }
    }
  };

  // Check if current user is owner or manager (admin access)
  const isManager = currentUser?.role?.slug === 'manager';
  const isOwner = currentUser?.isOwner;
  const canModify = isOwner || isManager;

  // Render error page if load fails
  if (isError) {
    return (
      <ErrorPage
        title="Failed to load staff list"
        message={
          (error as any)?.data?.message ||
          'There was a problem communicating with the server. Please verify your connection.'
        }
      />
    );
  }

  // Define Columns for DataTable
  const columns: Column<StaffUser>[] = [
    {
      key: 'fullName',
      label: 'Staff Member',
      render: (row: StaffUser) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200/80 text-secondary font-black flex items-center justify-center shrink-0 text-sm select-none">
            {row.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{row.fullName}</p>
            <p className="text-[11px] text-slate-400 font-medium font-sans lowercase truncate max-w-[160px] mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row: StaffUser) => (
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border border-slate-200/60 py-1 px-2.5 rounded-lg">
            {row.role?.name || (row.isOwner ? 'Owner' : 'Staff')}
          </span>
        </div>
      ),
    },
    {
      key: 'employeeDetails',
      label: 'Employee details',
      render: (row: StaffUser) => (
        <div className="space-y-0.5 text-xs text-slate-600 font-sans">
          <p>ID: <span className="font-semibold text-slate-800">{row.employeeId || 'N/A'}</span></p>
          <p>Dept: <span className="font-semibold text-slate-800">{row.department || 'N/A'}</span></p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contact No',
      render: (row: StaffUser) => <span className="text-xs font-medium text-slate-600 font-sans">{row.phone || '—'}</span>,
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      render: (row: StaffUser) => (
        <span className="text-xs text-slate-600 font-sans">
          {row.joiningDate ? new Date(row.joiningDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: StaffUser) => (
        <StatusChip
          status={row.isActive ? 'success' : 'error'}
          label={row.isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row: StaffUser) => {
        // Prevent manager from deactivating/modifying owner or other managers
        const isTargetOwner = row.isOwner;
        const isTargetManager = row.role?.slug === 'manager';
        const hasRestriction = isManager && (isTargetOwner || isTargetManager);
        const canAction = canModify && !hasRestriction && row.id !== currentUser?.id;

        if (!canAction) return null;

        return (
          <div className="flex justify-end select-none">
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, row)}
              className="hover:bg-slate-100 hover:text-slate-800 text-slate-400"
            >
              <MoreVertIcon className="h-5 w-5" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <div>
          <h1 className="text-xl font-black text-secondary font-heading leading-tight">
            Staff Members
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Manage your shop staff credentials, role-based access limits, and account status.
          </p>
        </div>

        {canModify && (
          <PrimaryButton
            onClick={() => {
              setSelectedStaff(null);
              setFormOpen(true);
            }}
            className="!py-2.5 !px-4 !text-xs w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-1.5">
              <PersonAddIcon className="h-4 w-4" />
              <span>Register Staff</span>
            </div>
          </PrimaryButton>
        )}
      </div>

      {/* Main Grid Card Content */}
      <AppCard>
        {/* Filters Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6 select-none">
          <div className="flex-1 max-w-md">
            <SearchToolbar
              value={search}
              onChange={setSearch}
              placeholder="Search staff by name, email, or employee ID..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role:</span>
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0); // MUI TablePagination uses 0-based indexing for internal page tracking
                }}
                size="small"
                className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-36"
                classes={{ select: '!py-1.5 !px-3' }}
              >
                <MenuItem value="all" className="!text-xs !font-sans font-medium">All Roles</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id || r._id} value={r.id || r._id} className="!text-xs !font-sans">
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </div>

            {/* Status Filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(0);
                }}
                size="small"
                className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-32"
                classes={{ select: '!py-1.5 !px-3' }}
              >
                <MenuItem value="all" className="!text-xs !font-sans font-medium">All Status</MenuItem>
                <MenuItem value="active" className="!text-xs !font-sans text-emerald-600 font-semibold">Active</MenuItem>
                <MenuItem value="inactive" className="!text-xs !font-sans text-rose-500 font-semibold">Inactive</MenuItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Paginated Data Table */}
        <div className="relative">
          {isLoading && <LoadingOverlay message="Loading staff accounts..." />}
          <DataTable
            columns={columns}
            data={staffMembers}
            loading={isLoading}
            page={page - 1} // Convert 1-indexed to 0-indexed for DataTable's TablePagination wrapper
            limit={limit}
            total={totalItems}
            onPageChange={(val) => setPage(val + 1)}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            emptyMessage="No staff accounts found matching your selected search criteria."
          />
        </div>
      </AppCard>

      {/* Floating Action Menu dropdown */}
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
        
        <MenuItem onClick={triggerChangeRole} className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50">
          <ManageAccountsIcon className="h-4 w-4 text-slate-400 shrink-0" />
          Change Role
        </MenuItem>

        <MenuItem onClick={triggerPasswordReset} className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50">
          <LockResetIcon className="h-4 w-4 text-slate-400 shrink-0" />
          Reset Password
        </MenuItem>

        <div className="my-1 border-t border-slate-100"></div>

        {activeMenuStaff?.isActive ? (
          <MenuItem 
            onClick={triggerDeactivateConfirm} 
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-rose-600 hover:!bg-rose-50/50"
          >
            <BlockIcon className="h-4 w-4 text-rose-400 shrink-0" />
            Deactivate Staff
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={triggerReactivateConfirm} 
            className="!text-xs !font-sans !py-2 !gap-2.5 !text-emerald-600 hover:!bg-emerald-50/50"
          >
            <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
            Reactivate Staff
          </MenuItem>
        )}
      </Menu>

      {/* dialog / forms modals */}
      {formOpen && (
        <StaffFormDialog
          open={formOpen}
          staff={selectedStaff}
          onClose={() => {
            setFormOpen(false);
            setSelectedStaff(null);
          }}
        />
      )}

      {passwordOpen && selectedStaff && (
        <ResetPasswordDialog
          open={passwordOpen}
          staff={selectedStaff}
          onClose={() => {
            setPasswordOpen(false);
            setSelectedStaff(null);
          }}
        />
      )}

      {roleOpen && selectedStaff && (
        <ChangeRoleDialog
          open={roleOpen}
          staff={selectedStaff}
          onClose={() => {
            setRoleOpen(false);
            setSelectedStaff(null);
          }}
        />
      )}

      {/* Deactivate confirmation Dialog */}
      {deactivateConfirmOpen && staffToAction && (
        <ConfirmDialog
          open={deactivateConfirmOpen}
          title="Deactivate Staff Account?"
          message={`Are you sure you want to deactivate the staff account for "${staffToAction.fullName}"? They will be immediately logged out and blocked from accessing any shop resources.`}
          confirmText="Deactivate"
          onConfirm={handleDeactivate}
          onClose={() => {
            setDeactivateConfirmOpen(false);
            setStaffToAction(null);
          }}
          loading={isDeactivating}
        />
      )}

      {/* Reactivate confirmation Dialog */}
      {reactivateConfirmOpen && staffToAction && (
        <ConfirmDialog
          open={reactivateConfirmOpen}
          title="Reactivate Staff Account?"
          message={`Are you sure you want to reactivate the staff account for "${staffToAction.fullName}"? They will be allowed to log into the shop portal and perform operational tasks immediately.`}
          confirmText="Reactivate"
          onConfirm={handleReactivate}
          onClose={() => {
            setReactivateConfirmOpen(false);
            setStaffToAction(null);
          }}
          loading={isReactivating}
        />
      )}
    </div>
  );
};

export default UserListScreen;

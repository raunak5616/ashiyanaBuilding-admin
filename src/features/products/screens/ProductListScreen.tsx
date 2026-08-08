import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppCard from '@/components/common/AppCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import ErrorPage from '@/components/common/ErrorPage';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import ProductTable from '../components/ProductTable';
import ProductFilters from '../components/ProductFilters';
import ProductSearch from '../components/ProductSearch';
import ProductForm from '../components/ProductForm';
import DeleteProductDialog from '../components/DeleteProductDialog';
import ArchiveDialog from '../components/ArchiveDialog';
import BulkActionToolbar from '../components/BulkActionToolbar';

import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useArchiveProductMutation,
  useRestoreProductMutation,
  Product,
} from '../productApi';

// MUI Core imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddIcon from '@mui/icons-material/Add';
import LoadingOverlay from '@/components/common/LoadingOverlay';

export const ProductListScreen: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Single Action Confirm Dialog states
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToAction, setProductToAction] = useState<Product | null>(null);

  // Bulk Action Confirm Dialog states
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // RTK Query list fetch
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProductsQuery({
    search: search.trim() || undefined,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    brandId: brandFilter === 'all' ? undefined : brandFilter,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
        ? true
        : false,
    page,
    limit,
  });

  // Mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [archiveProduct, { isLoading: isArchiving }] = useArchiveProductMutation();
  const [restoreProduct, { isLoading: isRestoring }] = useRestoreProductMutation();

  const products = productsResponse?.data || [];
  const totalItems = productsResponse?.metadata?.total || 0;

  // Search/Filter Reset wrappers
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleBrandChange = (val: string) => {
    setBrandFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: 'all' | 'active' | 'archived') => {
    setStatusFilter(val);
    setPage(1);
    setSelectedIds([]); // Clear selections when status changes
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // CRUD Submissions
  const handleFormSubmit = async (payload: any) => {
    setFormError(null);
    try {
      if (selectedProduct) {
        await updateProduct({ id: selectedProduct.id, body: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setFormOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      // Map validation or duplicate error codes
      const errorCode = err?.data?.errorCode || err?.data?.message;
      if (errorCode === 'DUPLICATE_SKU') {
        setFormError('The SKU code is already assigned to another product.');
      } else if (errorCode === 'DUPLICATE_BARCODE') {
        setFormError('The Barcode is already assigned to another product.');
      } else {
        setFormError(err?.data?.message || 'Failed to save product details. Please check inputs.');
      }
    }
  };

  // Single Actions executions
  const handleSingleArchive = async () => {
    if (!productToAction) return;
    try {
      await archiveProduct(productToAction.id).unwrap();
      setArchiveDialogOpen(false);
      setProductToAction(null);
    } catch (err) {
      console.error('Failed to archive product:', err);
    }
  };

  const handleSingleRestore = async () => {
    if (!productToAction) return;
    try {
      await restoreProduct(productToAction.id).unwrap();
      setRestoreDialogOpen(false);
      setProductToAction(null);
    } catch (err) {
      console.error('Failed to restore product:', err);
    }
  };

  const handleSingleDelete = async () => {
    if (!productToAction) return;
    try {
      // Soft delete is mapped to archive on the backend
      await archiveProduct(productToAction.id).unwrap();
      setDeleteDialogOpen(false);
      setProductToAction(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Bulk Actions executions
  const handleBulkArchive = async () => {
    try {
      // Perform parallel soft delete mutations
      await Promise.all(selectedIds.map((id) => archiveProduct(id).unwrap()));
      setSelectedIds([]);
      setBulkArchiveOpen(false);
    } catch (err) {
      console.error('Failed bulk archiving:', err);
    }
  };

  const handleBulkRestore = async () => {
    try {
      // Perform parallel restore mutations
      await Promise.all(selectedIds.map((id) => restoreProduct(id).unwrap()));
      setSelectedIds([]);
      setBulkRestoreOpen(false);
    } catch (err) {
      console.error('Failed bulk restoring:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Soft delete mapped to archive
      await Promise.all(selectedIds.map((id) => archiveProduct(id).unwrap()));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch (err) {
      console.error('Failed bulk deleting:', err);
    }
  };

  // Sorting utility
  const sortedProducts = [...products].sort((a, b) => {
    let fieldA = a[sortField as keyof Product];
    let fieldB = b[sortField as keyof Product];

    if (fieldA === undefined) return 1;
    if (fieldB === undefined) return -1;

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortOrder === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else {
      return sortOrder === 'asc'
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    }
  });

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load product catalog"
        message={
          (error as any)?.data?.message ||
          'There was a problem communicating with the server. Please verify your connection.'
        }
      />
    );
  }

  const isMutating = isCreating || isUpdating || isArchiving || isRestoring;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-secondary font-heading leading-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Create, view, modify, and archive inventory items, category groupings, and pricing structures.
          </p>
        </div>

        <PrimaryButton
          onClick={() => {
            setSelectedProduct(null);
            setFormError(null);
            setFormOpen(true);
          }}
          className="!py-2.5 !px-4 !text-xs w-full sm:w-auto"
        >
          <div className="flex items-center justify-center gap-1.5">
            <AddIcon className="h-4 w-4" />
            <span>Add Product</span>
          </div>
        </PrimaryButton>
      </div>

      {/* Main Grid Wrapper */}
      <AppCard>
        {/* Search & Filters block */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6">
          <div className="flex-1 max-w-md">
            <ProductSearch value={search} onChange={handleSearchChange} />
          </div>

          <ProductFilters
            categoryId={categoryFilter}
            onCategoryChange={handleCategoryChange}
            brandId={brandFilter}
            onBrandChange={handleBrandChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Paginated Products Table */}
        <div className="relative">
          {(isLoading || isFetching) && <LoadingOverlay message="Syncing product catalog..." />}
          
          <ProductTable
            products={sortedProducts}
            loading={isLoading || isFetching}
            page={page}
            limit={limit}
            total={totalItems}
            onPageChange={setPage}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            onView={(id) => navigate(`/products/${id}`)}
            onEdit={(prod) => {
              setSelectedProduct(prod);
              setFormError(null);
              setFormOpen(true);
            }}
            onArchive={(prod) => {
              setProductToAction(prod);
              setArchiveDialogOpen(true);
            }}
            onRestore={(prod) => {
              setProductToAction(prod);
              setRestoreDialogOpen(true);
            }}
            onDelete={(prod) => {
              setProductToAction(prod);
              setDeleteDialogOpen(true);
            }}
          />
        </div>
      </AppCard>

      {/* Floating Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkArchive={() => setBulkArchiveOpen(true)}
        onBulkRestore={() => setBulkRestoreOpen(true)}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        showRestoreButton={statusFilter === 'archived'}
      />

      {/* Creation / Editing Modal Dialog */}
      {formOpen && (
        <Dialog
          open={formOpen}
          onClose={isMutating ? undefined : () => setFormOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              className: '!rounded-2xl !p-2 border border-slate-100 shadow-2xl max-w-[800px]',
            },
          }}
        >
          <DialogTitle className="!font-heading !font-black !text-lg !text-secondary !pb-2 select-none">
            {selectedProduct ? 'Modify Catalog Item' : 'Add New Catalog Item'}
          </DialogTitle>
          <DialogContent className="!pb-2 !pt-2">
            <ProductForm
              product={selectedProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormOpen(false)}
              loading={isMutating}
              error={formError}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialogs - Single actions */}
      {archiveDialogOpen && productToAction && (
        <ArchiveDialog
          open={archiveDialogOpen}
          onClose={() => {
            setArchiveDialogOpen(false);
            setProductToAction(null);
          }}
          onConfirm={handleSingleArchive}
          productName={productToAction.name}
          action="archive"
          loading={isMutating}
        />
      )}

      {restoreDialogOpen && productToAction && (
        <ArchiveDialog
          open={restoreDialogOpen}
          onClose={() => {
            setRestoreDialogOpen(false);
            setProductToAction(null);
          }}
          onConfirm={handleSingleRestore}
          productName={productToAction.name}
          action="restore"
          loading={isMutating}
        />
      )}

      {deleteDialogOpen && productToAction && (
        <DeleteProductDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setProductToAction(null);
          }}
          onConfirm={handleSingleDelete}
          productName={productToAction.name}
          loading={isMutating}
        />
      )}

      {/* Confirmation Dialogs - Bulk actions */}
      {bulkArchiveOpen && (
        <ConfirmDialog
          open={bulkArchiveOpen}
          title="Archive Selected Products?"
          message={`Are you sure you want to archive the ${selectedIds.length} selected products? They will be set as archived and hidden from POS sales.`}
          confirmText="Archive All"
          onConfirm={handleBulkArchive}
          onClose={() => setBulkArchiveOpen(false)}
          loading={isMutating}
        />
      )}

      {bulkRestoreOpen && (
        <ConfirmDialog
          open={bulkRestoreOpen}
          title="Restore Selected Products?"
          message={`Are you sure you want to restore the ${selectedIds.length} selected products? This makes them available for transactions immediately.`}
          confirmText="Restore All"
          onConfirm={handleBulkRestore}
          onClose={() => setBulkRestoreOpen(false)}
          loading={isMutating}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog
          open={bulkDeleteOpen}
          title="Delete Selected Products?"
          message={`Are you sure you want to soft delete the ${selectedIds.length} selected products? This will deactivate their catalog accounts.`}
          confirmText="Delete All"
          onConfirm={handleBulkDelete}
          onClose={() => setBulkDeleteOpen(false)}
          loading={isMutating}
        />
      )}
    </div>
  );
};

export default ProductListScreen;

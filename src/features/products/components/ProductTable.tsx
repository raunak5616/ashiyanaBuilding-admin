import React, { useState } from 'react';
import { Product, useGetCategoriesQuery, useGetBrandsQuery, useGetUnitsQuery } from '../productApi';
import ProductStatusChip from './ProductStatusChip';

// Material UI Core Table & controls
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

// Material UI Icons
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';

import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  onEdit: (product: Product) => void;
  onView: (id: string) => void;
  onArchive: (product: Product) => void;
  onRestore: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface ColumnConfig {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  selectedIds,
  onSelectionChange,
  sortField,
  sortOrder,
  onSortChange,
  onEdit,
  onView,
  onArchive,
  onRestore,
  onDelete,
}) => {
  // Fetch Category, Brand, Unit lookup queries
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: brandsResponse } = useGetBrandsQuery();
  const { data: unitsResponse } = useGetUnitsQuery();

  const categories = categoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const units = unitsResponse?.data || [];

  // Helper Maps for fast name lookup
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));
  const unitMap = new Map(units.map((u) => [u.id, u.abbreviation]));

  // Anchor elements for menus
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [rowMenuAnchor, setRowMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeMenuProduct, setActiveMenuProduct] = useState<Product | null>(null);

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'image',
    'name',
    'sku',
    'category',
    'brand',
    'unit',
    'purchasePrice',
    'sellingPrice',
    'taxRate',
    'status',
  ]);

  const columns: ColumnConfig[] = [
    { id: 'image', label: 'Image' },
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'sku', label: 'SKU Code', sortable: true },
    { id: 'barcode', label: 'Barcode', sortable: true },
    { id: 'category', label: 'Category' },
    { id: 'brand', label: 'Brand' },
    { id: 'unit', label: 'Unit' },
    { id: 'purchasePrice', label: 'Purchase (₹)', align: 'right', sortable: true },
    { id: 'sellingPrice', label: 'Selling (₹)', align: 'right', sortable: true },
    { id: 'taxRate', label: 'GST (%)', align: 'center', sortable: true },
    { id: 'minimumStock', label: 'Min Stock', align: 'center', sortable: true },
    { id: 'status', label: 'Status' },
  ];

  const handleToggleColumn = (colId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map((p) => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  const handleSortRequest = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    onSortChange(field, isAsc ? 'desc' : 'asc');
  };

  const handleRowMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    setRowMenuAnchor(e.currentTarget);
    setActiveMenuProduct(product);
  };

  const handleRowMenuClose = () => {
    setRowMenuAnchor(null);
    setActiveMenuProduct(null);
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (products.length === 0) return;
    
    const headers = [
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Brand',
      'Unit',
      'Purchase Price (INR)',
      'Selling Price (INR)',
      'GST (%)',
      'Min Stock',
      'Status',
    ];

    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.barcode || '',
      categoryMap.get(p.categoryId || '') || '—',
      brandMap.get(p.brandId || '') || '—',
      unitMap.get(p.unitId || '') || '—',
      p.purchasePrice / 100,
      p.sellingPrice / 100,
      p.taxRate,
      p.minimumStock || 0,
      p.isActive ? 'Active' : 'Archived',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ashiyana_products_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Table Action Headers */}
      <div className="flex justify-between items-center bg-[#FAFAFA] p-3 rounded-2xl border border-slate-100">
        <span className="text-xs font-bold text-slate-500 font-sans">
          Catalog Items ({total} items total)
        </span>
        <div className="flex gap-2">
          {/* Column Toggle Button */}
          <Button
            variant="text"
            size="small"
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            startIcon={<ViewColumnIcon className="h-4 w-4" />}
            className="!text-slate-600 hover:!bg-slate-100 !text-xs !normal-case !font-bold !rounded-xl"
          >
            Columns
          </Button>

          {/* Export CSV Button */}
          <Button
            variant="text"
            size="small"
            onClick={handleExportCSV}
            disabled={products.length === 0}
            startIcon={<FileDownloadIcon className="h-4 w-4" />}
            className="!text-slate-600 hover:!bg-slate-100 !text-xs !normal-case !font-bold !rounded-xl"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Column Visibility Selector Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        slotProps={{ paper: { className: '!rounded-xl border border-slate-100 shadow-xl' } }}
      >
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
          Toggle Columns
        </div>
        {columns.map((col) => (
          <MenuItem
            key={col.id}
            onClick={() => handleToggleColumn(col.id)}
            className="!text-xs !font-sans !py-1"
          >
            <Checkbox
              checked={visibleColumns.includes(col.id)}
              size="small"
              className="!p-1"
            />
            {col.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Main Table Container */}
      <div className="relative bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col w-full">
        {loading && <LoadingOverlay message="Fetching product listings..." />}

        <TableContainer className="overflow-x-auto w-full">
          <Table className="w-full text-left border-collapse">
            <TableHead>
              <TableRow className="border-b border-slate-100 bg-[#FAFAFA]">
                {/* Selection Checkbox Cell */}
                <TableCell className="!px-4 !py-3.5 !border-none !w-12">
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                    className="!p-0"
                  />
                </TableCell>

                {/* Render Header Columns */}
                {columns
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      className={`!px-4 !py-3.5 !text-[9px] !font-bold !text-slate-400 !uppercase !tracking-widest !font-sans !border-none`}
                    >
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortField === col.id}
                          direction={sortField === col.id ? sortOrder : 'asc'}
                          onClick={() => handleSortRequest(col.id)}
                          className="hover:!text-slate-700"
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                {/* Actions cell */}
                <TableCell align="right" className="!px-6 !py-3.5 !border-none" />
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-slate-100/80">
              {products.length > 0 ? (
                products.map((row) => {
                  const isChecked = selectedIds.includes(row.id);
                  const firstImage = row.images?.[0]?.url || null;

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      className={`hover:bg-slate-50/40 transition-colors font-sans duration-150 ${
                        isChecked ? 'bg-primary/5/30' : ''
                      }`}
                    >
                      {/* Selection checkbox */}
                      <TableCell className="!px-4 !py-3 !border-none">
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => handleSelectItem(row.id, e.target.checked)}
                          size="small"
                          className="!p-0"
                        />
                      </TableCell>

                      {/* Product Thumbnail */}
                      {visibleColumns.includes('image') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <div className="w-10 h-10 border border-slate-150 bg-slate-50/50 rounded-lg overflow-hidden flex items-center justify-center">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={row.name}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold select-none">
                                Box
                              </span>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {/* Name */}
                      {visibleColumns.includes('name') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="font-bold text-slate-800 text-sm block truncate max-w-[200px]">
                            {row.name}
                          </span>
                        </TableCell>
                      )}

                      {/* SKU */}
                      {visibleColumns.includes('sku') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="text-xs font-mono font-bold text-secondary uppercase bg-slate-100 border border-slate-200/40 py-0.5 px-2 rounded-md">
                            {row.sku}
                          </span>
                        </TableCell>
                      )}

                      {/* Barcode */}
                      {visibleColumns.includes('barcode') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="text-xs text-slate-500 font-sans">
                            {row.barcode || '—'}
                          </span>
                        </TableCell>
                      )}

                      {/* Category */}
                      {visibleColumns.includes('category') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="text-xs text-slate-600 font-medium">
                            {categoryMap.get(row.categoryId || '') || '—'}
                          </span>
                        </TableCell>
                      )}

                      {/* Brand */}
                      {visibleColumns.includes('brand') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="text-xs text-slate-600 font-medium">
                            {brandMap.get(row.brandId || '') || '—'}
                          </span>
                        </TableCell>
                      )}

                      {/* Unit */}
                      {visibleColumns.includes('unit') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <span className="text-xs text-slate-650 bg-slate-50 border border-slate-200/40 px-2 py-0.5 rounded-md font-sans">
                            {unitMap.get(row.unitId || '') || '—'}
                          </span>
                        </TableCell>
                      )}

                      {/* Purchase Price */}
                      {visibleColumns.includes('purchasePrice') && (
                        <TableCell align="right" className="!px-4 !py-3 !border-none">
                          <span className="text-xs font-bold text-slate-700 font-mono">
                            ₹{(row.purchasePrice / 100).toFixed(2)}
                          </span>
                        </TableCell>
                      )}

                      {/* Selling Price */}
                      {visibleColumns.includes('sellingPrice') && (
                        <TableCell align="right" className="!px-4 !py-3 !border-none">
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            ₹{(row.sellingPrice / 100).toFixed(2)}
                          </span>
                        </TableCell>
                      )}

                      {/* Tax Rate */}
                      {visibleColumns.includes('taxRate') && (
                        <TableCell align="center" className="!px-4 !py-3 !border-none">
                          <span className="text-xs font-medium text-slate-600 font-sans">
                            {row.taxRate}%
                          </span>
                        </TableCell>
                      )}

                      {/* Min Stock */}
                      {visibleColumns.includes('minimumStock') && (
                        <TableCell align="center" className="!px-4 !py-3 !border-none">
                          <span className="text-xs font-bold text-slate-600 font-mono">
                            {row.minimumStock || 0}
                          </span>
                        </TableCell>
                      )}

                      {/* Status */}
                      {visibleColumns.includes('status') && (
                        <TableCell className="!px-4 !py-3 !border-none">
                          <ProductStatusChip isActive={row.isActive} />
                        </TableCell>
                      )}

                      {/* Menu Actions Trigger */}
                      <TableCell align="right" className="!px-6 !py-3 !border-none">
                        <IconButton
                          size="small"
                          onClick={(e) => handleRowMenuOpen(e, row)}
                          className="hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                        >
                          <MoreVertIcon className="h-4 w-4" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                !loading && (
                  <TableRow>
                    <td colSpan={visibleColumns.length + 2} className="!px-4 !py-10">
                      <EmptyState
                        title="No Products Found"
                        message="There are no products in the catalog matching your filter parameters."
                      />
                    </td>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        {products.length > 0 && (
          <div className="border-t border-slate-100 flex items-center justify-end px-4 py-1.5 bg-[#FAFAFA]/50">
            <TablePagination
              component="div"
              count={total}
              page={page - 1} // MUI uses 0-indexed page
              onPageChange={(_, newPage) => onPageChange(newPage + 1)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[10, 20, 50]}
              classes={{
                root: '!text-xs !text-slate-500 !font-sans',
                selectLabel: '!text-xs !text-slate-400 !font-sans',
                displayedRows: '!text-xs !text-slate-500 !font-sans',
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Action Menu dropdown */}
      <Menu
        anchorEl={rowMenuAnchor}
        open={Boolean(rowMenuAnchor)}
        onClose={handleRowMenuClose}
        slotProps={{
          paper: {
            className: '!rounded-xl !shadow-xl border border-slate-100 !py-1 !min-w-[160px]',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuProduct) onView(activeMenuProduct.id);
            handleRowMenuClose();
          }}
          className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50"
        >
          <VisibilityIcon className="h-4 w-4 text-slate-400 shrink-0" />
          View Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeMenuProduct) onEdit(activeMenuProduct);
            handleRowMenuClose();
          }}
          className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50"
        >
          <EditIcon className="h-4 w-4 text-slate-400 shrink-0" />
          Edit Product
        </MenuItem>

        <div className="my-1 border-t border-slate-100" />

        {activeMenuProduct?.isActive ? (
          <>
            <MenuItem
              onClick={() => {
                if (activeMenuProduct) onArchive(activeMenuProduct);
                handleRowMenuClose();
              }}
              className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50 !text-amber-600"
            >
              <ArchiveIcon className="h-4 w-4 text-amber-400 shrink-0" />
              Archive Product
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (activeMenuProduct) onDelete(activeMenuProduct);
                handleRowMenuClose();
              }}
              className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-rose-50/50 !text-rose-600"
            >
              <DeleteIcon className="h-4 w-4 text-rose-400 shrink-0" />
              Delete Product
            </MenuItem>
          </>
        ) : (
          <MenuItem
            onClick={() => {
              if (activeMenuProduct) onRestore(activeMenuProduct);
              handleRowMenuClose();
            }}
            className="!text-xs !font-sans !py-2 !gap-2.5 hover:!bg-slate-50 !text-emerald-600"
          >
            <RestoreIcon className="h-4 w-4 text-emerald-400 shrink-0" />
            Restore Product
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default ProductTable;

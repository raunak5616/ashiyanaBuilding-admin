import React from 'react';
import LoadingOverlay from './LoadingOverlay';
import EmptyState from './EmptyState';
import TablePagination from '@mui/material/TablePagination';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyMessage,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  const hasPagination = 
    page !== undefined && 
    limit !== undefined && 
    total !== undefined && 
    onPageChange !== undefined;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col w-full">
      {/* Loading overlay panel */}
      {loading && <LoadingOverlay />}

      {/* Responsive table container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAFA] select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-slate-50/40 transition-colors font-sans duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-3.5 text-xs text-slate-700 whitespace-nowrap leading-relaxed ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (row[col.key as keyof T] as unknown as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10">
                    <EmptyState title={emptyTitle} message={emptyMessage} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer bar */}
      {hasPagination && data.length > 0 && (
        <div className="border-t border-slate-100 flex items-center justify-end px-4 py-1.5 select-none bg-[#FAFAFA]/50">
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => onLimitChange?.(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[10, 25, 50]}
            classes={{
              root: '!text-xs !text-slate-500 !font-sans',
              selectLabel: '!text-xs !text-slate-400 !font-sans',
              displayedRows: '!text-xs !text-slate-500 !font-sans',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;

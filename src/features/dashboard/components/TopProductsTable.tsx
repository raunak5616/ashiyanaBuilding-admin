import React from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import { DashboardSummary } from '../dashboardApi';

interface TopProductsTableProps {
  products: DashboardSummary['topSellingProducts'];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const columns: Column<DashboardSummary['topSellingProducts'][number]>[] = [
    {
      key: 'name',
      label: 'Product Name',
      render: (row) => <span className="font-bold text-slate-800">{row.name}</span>,
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (row) => <span className="font-semibold text-slate-400 uppercase">{row.sku}</span>,
    },
    {
      key: 'totalQuantity',
      label: 'Units Sold',
      align: 'center',
      render: (row) => <span className="font-black text-secondary">{row.totalQuantity}</span>,
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      align: 'right',
      render: (row) => <span className="font-black text-emerald-600">{formatCurrency(row.totalRevenue)}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      emptyTitle="No Selling Data"
      emptyMessage="No product sales have been logged for this period."
    />
  );
};

export default TopProductsTable;

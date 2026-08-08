import React from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import { DashboardSummary } from '../dashboardApi';

interface RecentSalesTableProps {
  sales: DashboardSummary['recentSales'];
}

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ sales }) => {
  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  const columns: Column<DashboardSummary['recentSales'][number]>[] = [
    {
      key: 'saleNumber',
      label: 'Invoice #',
      render: (row) => <span className="font-bold text-slate-800">{row.saleNumber}</span>,
    },
    {
      key: 'saleDate',
      label: 'Date',
      render: (row) => <span>{formatDate(row.saleDate)}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => <span>{row.customer?.fullName || 'Walk-in Customer'}</span>,
    },
    {
      key: 'grandTotal',
      label: 'Grand Total',
      align: 'right',
      render: (row) => <span className="font-black text-slate-900">{formatCurrency(row.grandTotal)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => {
        const isSuccess = row.status === 'completed';
        const label = isSuccess ? 'Paid' : row.status;
        return <StatusChip label={label} status={isSuccess ? 'success' : 'warning'} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sales}
      emptyTitle="No Recent Sales"
      emptyMessage="No sales invoices have been processed yet."
    />
  );
};

export default RecentSalesTable;

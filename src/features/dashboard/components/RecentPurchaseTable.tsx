import React from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import { DashboardSummary } from '../dashboardApi';

interface RecentPurchaseTableProps {
  purchases: DashboardSummary['recentPurchases'];
}

export const RecentPurchaseTable: React.FC<RecentPurchaseTableProps> = ({ purchases }) => {
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

  const columns: Column<DashboardSummary['recentPurchases'][number]>[] = [
    {
      key: 'purchaseNumber',
      label: 'PO #',
      render: (row) => <span className="font-bold text-slate-800">{row.purchaseNumber}</span>,
    },
    {
      key: 'purchaseDate',
      label: 'Date',
      render: (row) => <span>{formatDate(row.purchaseDate)}</span>,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (row) => <span>{row.supplier?.companyName || row.supplier?.name || 'Unknown Supplier'}</span>,
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
        const isSuccess = row.status === 'confirmed';
        const label = isSuccess ? 'Received' : row.status;
        return <StatusChip label={label} status={isSuccess ? 'success' : 'warning'} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={purchases}
      emptyTitle="No Recent Purchases"
      emptyMessage="No stock purchase intakes have been logged yet."
    />
  );
};

export default RecentPurchaseTable;

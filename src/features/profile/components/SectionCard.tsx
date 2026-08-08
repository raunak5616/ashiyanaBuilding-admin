import React from 'react';
import AppCard from '@/components/common/AppCard';

interface SectionCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <AppCard
      title={title}
      subtitle={subtitle}
      action={action}
      className={`premium-shadow premium-card-hover border border-slate-200/50 bg-white rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </AppCard>
  );
};

export default SectionCard;

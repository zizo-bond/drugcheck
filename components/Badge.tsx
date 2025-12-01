import React from 'react';
import { InteractionSeverity } from '../types';

interface BadgeProps {
  severity: InteractionSeverity;
}

const Badge: React.FC<BadgeProps> = ({ severity }) => {
  let colorClass = '';
  let label = '';

  switch (severity) {
    case InteractionSeverity.HIGH:
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      label = 'خطر مرتفع (High)';
      break;
    case InteractionSeverity.MODERATE:
      colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
      label = 'متوسط (Moderate)';
      break;
    case InteractionSeverity.LOW:
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      label = 'منخفض (Low)';
      break;
    case InteractionSeverity.CONTRAINDICATED:
      colorClass = 'bg-gray-900 text-white border-gray-700';
      label = 'ممنوع (Contraindicated)';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      label = 'غير محدد';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass} shadow-sm`}>
      {label}
    </span>
  );
};

export default Badge;
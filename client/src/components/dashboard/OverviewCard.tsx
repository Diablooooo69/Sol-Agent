import React from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';

interface OverviewCardProps {
  title: string;
  value: string | number;
  change?: string;
  description?: string;
  icon: string;
  iconColor: string;
  action?: {
    label: string;
    onClick: () => void;
    color?: "default" | "red" | "blue" | "green" | "yellow" | "purple";
  };
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  change,
  description,
  icon,
  iconColor,
  action
}) => {
  return (
    <BrutalistCard>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-mono font-bold text-lg">{title}</h2>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${iconColor} border-2 border-black`}>
          <i className={`${icon} text-white`}></i>
        </div>
      </div>
      
      <div className="flex items-end mb-3">
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p className={`ml-2 text-sm font-bold ${change.startsWith('+') ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
            {change}
          </p>
        )}
      </div>
      
      {description && <p className="text-gray-400 text-sm">{description}</p>}
      
      {action && (
        <BrutalistButton
          className="mt-3 py-1 px-3 text-sm"
          color={action.color || "blue"}
          onClick={action.onClick}
        >
          {action.label}
        </BrutalistButton>
      )}
    </BrutalistCard>
  );
};

export default OverviewCard;

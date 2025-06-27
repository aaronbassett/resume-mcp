import type { FC } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { NumberTicker } from '../ui/NumberTicker';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'flat';
}

export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  trend
}) => {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  };

  // Extract numeric value for NumberTicker
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
    : value;

  const isNumeric = !isNaN(numericValue) && isFinite(numericValue);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isNumeric ? (
            <NumberTicker
              value={numericValue}
              className="text-2xl font-bold"
              prefix={typeof value === 'string' && value.includes('$') ? '$' : ''}
              suffix={typeof value === 'string' && value.includes('%') ? '%' : 
                     typeof value === 'string' && value.includes('ms') ? 'ms' : 
                     typeof value === 'string' && value.includes('k') ? 'k' : ''}
              decimalPlaces={typeof value === 'string' && value.includes('.') ? 1 : 0}
            />
          ) : (
            value
          )}
        </div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]} flex items-center mt-1`}>
            {trend === 'up' && '↗ '}
            {trend === 'down' && '↘ '}
            {trend === 'flat' && '→ '}
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface TopItem {
  name: string;
  count: number;
  percentage: number;
  subtitle?: string;
}

interface TopItemsListProps {
  title: string;
  description: string;
  items: TopItem[];
  icon?: React.ReactNode;
}

export const TopItemsList: FC<TopItemsListProps> = ({
  title,
  description,
  items,
  icon
}) => {
  const maxCount = Math.max(...items.map(item => item.count));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 8).map((item, index) => {
            const width = (item.count / maxCount) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>{item.count}</span>
                    <span className="text-xs">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface RequestsChartProps {
  data: Array<{ date: string; count: number; uniqueConsumers: number }>;
  title: string;
  description: string;
}

export const RequestsChart: FC<RequestsChartProps> = ({ data, title, description }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  const maxConsumers = Math.max(...data.map(d => d.uniqueConsumers));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart visualization */}
          <div className="h-64 flex items-end space-x-1">
            {data.slice(-14).map((item, index) => {
              const height = (item.count / maxCount) * 100;
              const date = new Date(item.date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${
                        isToday ? 'bg-primary' : 'bg-primary/60'
                      }`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{item.count} requests</div>
                      <div className="text-muted-foreground">{item.uniqueConsumers} unique</div>
                      <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top-left">
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Total Requests</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/60 rounded"></div>
              <span>Previous Days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
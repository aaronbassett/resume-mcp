import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface LLMData {
  llm: string;
  count: number;
  percentage: number;
}

interface LLMBreakdownChartProps {
  data: LLMData[];
}

const llmColors: Record<string, string> = {
  'GPT-4': '#10b981',
  'GPT-3.5-turbo': '#06b6d4',
  'Claude-3-Opus': '#8b5cf6',
  'Claude-3-Sonnet': '#a855f7',
  'Claude-3-Haiku': '#c084fc',
  'Gemini-Pro': '#f59e0b',
  'PaLM-2': '#ef4444',
  'Unknown': '#6b7280'
};

export const LLMBreakdownChart: FC<LLMBreakdownChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = data.map(item => {
    const angle = (item.count / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: llmColors[item.llm] || llmColors.Unknown
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Breakdown</CardTitle>
        <CardDescription>Requests by detected language model</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgb(var(--muted))"
                strokeWidth="2"
              />
              {segments.map((segment, index) => {
                const radius = 70;
                const centerX = 80;
                const centerY = 80;
                
                const startAngleRad = (segment.startAngle * Math.PI) / 180;
                const endAngleRad = (segment.endAngle * Math.PI) / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={segment.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: llmColors[item.llm] || llmColors.Unknown }}
                  />
                  <span className="text-sm font-medium">{item.llm}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
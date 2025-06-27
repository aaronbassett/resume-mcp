import type { FC } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

// Mock world countries data - in a real app, you'd import actual geo data
const mockWorldCountries = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'USA' },
      geometry: { type: 'Polygon', coordinates: [[[-100, 40], [-90, 40], [-90, 50], [-100, 50], [-100, 40]]] }
    },
    {
      type: 'Feature', 
      properties: { id: 'CAN' },
      geometry: { type: 'Polygon', coordinates: [[[-110, 50], [-100, 50], [-100, 60], [-110, 60], [-110, 50]]] }
    },
    {
      type: 'Feature',
      properties: { id: 'GBR' },
      geometry: { type: 'Polygon', coordinates: [[[0, 50], [5, 50], [5, 55], [0, 55], [0, 50]]] }
    }
  ]
};

interface ChoroplethMapProps {
  data: Array<{ id: string; value: number }>;
  title: string;
  description: string;
}

export const ChoroplethMap: FC<ChoroplethMapProps> = ({ data, title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {/* Placeholder for choropleth map */}
          <div className="h-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-semibold mb-2">World Map Visualization</div>
              <p className="text-sm">Choropleth map would display here</p>
              <p className="text-xs mt-2">Requires world geo data to render properly</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
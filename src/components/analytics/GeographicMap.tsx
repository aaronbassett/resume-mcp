import type { FC } from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface GeographicData {
  country: string;
  city: string;
  count: number;
}

interface GeographicMapProps {
  data: GeographicData[];
}

export const GeographicMap: FC<GeographicMapProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  // Group by country
  const countryData = data.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = { count: 0, cities: [] };
    }
    acc[item.country].count += item.count;
    acc[item.country].cities.push({ city: item.city, count: item.count });
    return acc;
  }, {} as Record<string, { count: number; cities: Array<{ city: string; count: number }> }>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <div>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Requests by location</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* World map placeholder - in a real app, you'd use a proper map library */}
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Interactive world map would go here</p>
              <p className="text-xs">Consider integrating with Mapbox or Google Maps</p>
            </div>
          </div>

          {/* Country/City breakdown */}
          <div className="space-y-3">
            {Object.entries(countryData)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 8)
              .map(([country, info]) => {
                const width = (info.count / maxCount) * 100;
                
                return (
                  <div key={country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{country}</div>
                      <div className="text-sm text-muted-foreground">{info.count} requests</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    {/* Top cities in this country */}
                    <div className="ml-4 space-y-1">
                      {info.cities
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                        .map((cityInfo, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{cityInfo.city}</span>
                            <span>{cityInfo.count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
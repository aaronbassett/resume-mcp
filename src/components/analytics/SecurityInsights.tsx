import type { FC } from 'react';
import { Shield, AlertTriangle, Ban, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface SuspiciousPattern {
  type: 'rate_limit' | 'weird_user_agent' | 'suspicious_timing';
  description: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

interface SecurityInsightsProps {
  spamRequestsBlocked: number;
  suspiciousPatterns: SuspiciousPattern[];
}

export const SecurityInsights: FC<SecurityInsightsProps> = ({
  spamRequestsBlocked,
  suspiciousPatterns
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <div>
            <CardTitle>Security Insights</CardTitle>
            <CardDescription>Spam detection and suspicious activity monitoring</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Spam Blocked Summary */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <Ban className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  {spamRequestsBlocked} spam requests blocked
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Automatic protection is active
                </div>
              </div>
            </div>
          </div>

          {/* Suspicious Patterns */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Detected Patterns
            </h4>
            {suspiciousPatterns.map((pattern, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(pattern.severity)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(pattern.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{pattern.description}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{pattern.count}</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(pattern.severity)}`}>
                        {pattern.severity}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm opacity-80 mt-1">
                    Pattern type: {pattern.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Security Recommendations
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enable rate limiting for additional protection</li>
              <li>• Review suspicious patterns regularly</li>
              <li>• Consider IP allowlisting for sensitive resumes</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
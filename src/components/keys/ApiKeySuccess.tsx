import type { FC } from 'react';
import { useState } from 'react';
import { CheckCircle, Copy, Key, AlertTriangle, Shield, Clock, Globe, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CodeSnippets } from './CodeSnippets';
import type { ApiKey } from '../../types/apiKeys';

interface ApiKeySuccessProps {
  apiKey: ApiKey;
  plainKey: string;
  onDone: () => void;
}

export const ApiKeySuccess: FC<ApiKeySuccessProps> = ({ apiKey, plainKey, onDone }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Format permissions for display
  const permissionsString = Array.isArray(apiKey.permissions) 
    ? apiKey.permissions.join(', ') 
    : 'read';

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle>API Key Created Successfully</CardTitle>
              <CardDescription>Your new API key has been generated</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Key Display */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Your API Key</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                {plainKey}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Permissions</span>
              </div>
              <div className="text-muted-foreground">
                {permissionsString}
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Expiration</span>
              </div>
              <div className="text-muted-foreground">
                {apiKey.expires_at 
                  ? new Date(apiKey.expires_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never expires'}
              </div>
            </div>
            
            {apiKey.rate_limit && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Rate Limit</span>
                </div>
                <div className="text-muted-foreground">
                  {apiKey.rate_limit} requests per hour
                </div>
              </div>
            )}
            
            {apiKey.rotation_policy && apiKey.rotation_policy !== 'never' && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Rotation Policy</span>
                </div>
                <div className="text-muted-foreground">
                  {apiKey.rotation_policy.charAt(0).toUpperCase() + apiKey.rotation_policy.slice(1)}
                </div>
              </div>
            )}
          </div>
          
          {/* Important Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300">
                  Important: Save Your API Key Now
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This is the only time your full API key will be displayed. Please copy it and store it securely. You won't be able to retrieve it later.
                </p>
              </div>
            </div>
          </div>
          
          {/* Done Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onDone}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Integration Examples */}
      <CodeSnippets apiKey={plainKey} />
    </div>
  );
};
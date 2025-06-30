import type { FC } from 'react';
import { useState } from 'react';
import { Key, Calendar, RefreshCw, Trash2, AlertTriangle, Globe, Shield, Code, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { ApiKeyRotationModal } from './ApiKeyRotationModal';
import { revokeApiKey, rotateApiKey } from '../../lib/apiKeyService';
import type { ApiKeyWithResume } from '../../types/apiKeys';

interface ApiKeyCardProps {
  apiKey: ApiKeyWithResume;
  onKeyRevoked: () => void;
  onKeyRotated?: (newKey: string) => void;
}

export const ApiKeyCard: FC<ApiKeyCardProps> = ({ apiKey, onKeyRevoked, onKeyRotated }) => {
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRevokeKey = async () => {
    setIsRevoking(true);
    try {
      const result = await revokeApiKey(apiKey.id);
      if (!result.error) {
        onKeyRevoked();
      } else {
        alert(`Failed to revoke key: ${result.error}`);
      }
    } catch (error) {
      console.error('Error revoking key:', error);
      alert('Failed to revoke key');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRotateKey = async () => {
    setShowRotationModal(true);
  };

  const performRotation = async (): Promise<string | null> => {
    setIsRotating(true);
    try {
      const result = await rotateApiKey(apiKey.id, 'manual');
      
      if (result.error) {
        console.error('Error rotating key:', result.error);
        return null;
      } else if (result.data?.newKey) {
        return result.data.newKey;
      }
      return null;
    } catch (error) {
      // Catch any unexpected errors and return null
      console.error('Unexpected error during key rotation:', error);
      return null;
    } finally {
      setIsRotating(false);
    }
  };

  const handleRotationComplete = (newKey: string) => {
    if (onKeyRotated) {
      onKeyRotated(newKey);
    }
    setShowRotationModal(false);
  };

  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
  const isMaxedOut = apiKey.max_uses !== null && apiKey.use_count >= apiKey.max_uses;
  const needsRotation = apiKey.next_rotation_date && new Date(apiKey.next_rotation_date) < new Date();
  
  // Format the masked key
  const maskedKey = apiKey.key_prefix 
    ? `${apiKey.key_prefix}••••••••••••••••••••••••••••••••`
    : '••••••••••••••••••••••••••••••••••••••••';

  // Get permissions as a string
  const permissionsString = Array.isArray(apiKey.permissions) 
    ? apiKey.permissions.join(', ') 
    : 'read';

  // Check if key has admin permissions
  const hasAdminPermissions = apiKey.permissions?.includes('read:all') && apiKey.permissions?.includes('write:all');

  return (
    <>
      <Card className={`${!apiKey.is_active || isExpired || isMaxedOut ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${hasAdminPermissions ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                <Key className={`h-5 w-5 ${hasAdminPermissions ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                <CardDescription>
                  {hasAdminPermissions ? 'Admin Key' : 'Standard Key'} • {apiKey.resume?.title || 'All Resumes'}
                </CardDescription>
              </div>
            </div>
            
            {(!apiKey.is_active || isExpired || isMaxedOut) && (
              <div className="bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 rounded-full">
                {!apiKey.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Max Uses Reached'}
              </div>
            )}
            
            {needsRotation && apiKey.is_active && !isExpired && !isMaxedOut && (
              <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium px-2 py-1 rounded-full">
                Rotation Needed
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Display */}
          <div className="font-mono text-sm bg-muted p-2 rounded-lg overflow-hidden">
            {maskedKey}
          </div>
          
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Created</div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{formatDate(apiKey.created_at)}</span>
              </div>
            </div>
            
            <div>
              <div className="text-muted-foreground mb-1">Expires</div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Never'}</span>
              </div>
            </div>
            
            <div>
              <div className="text-muted-foreground mb-1">Last Used</div>
              <div>{apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}</div>
            </div>
            
            <div>
              <div className="text-muted-foreground mb-1">Usage</div>
              <div>{apiKey.usage_count} calls from {apiKey.unique_ips || 0} IPs</div>
            </div>
          </div>
          
          {/* Permissions */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Permissions</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {permissionsString}
            </div>
          </div>
          
          {/* Max Uses */}
          {apiKey.max_uses !== null && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Usage Limit</span>
                <span className="text-sm">{apiKey.usage_count} / {apiKey.max_uses}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${!apiKey.is_active ? 'bg-gray-400' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (apiKey.usage_count / apiKey.max_uses) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Rate Limit */}
          {apiKey.rate_limit && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rate Limit</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {apiKey.rate_limit} requests per hour
              </div>
            </div>
          )}
          
          {/* Advanced Details Toggle */}
          {apiKey.is_active && !isExpired && !isMaxedOut && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-center text-muted-foreground"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
          
          {/* Advanced Details */}
          {showDetails && (
            <div className="space-y-3 border-t pt-3">
              {/* Rotation Policy */}
              {apiKey.rotation_policy && apiKey.rotation_policy !== 'never' && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rotation Policy</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {apiKey.rotation_policy.charAt(0).toUpperCase() + apiKey.rotation_policy.slice(1)}
                    {apiKey.next_rotation_date && (
                      <div className="mt-1">
                        Next rotation: {formatDate(apiKey.next_rotation_date)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* IP Whitelist */}
              {apiKey.ip_whitelist && apiKey.ip_whitelist.length > 0 && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">IP Whitelist</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {apiKey.ip_whitelist.join(', ')}
                  </div>
                </div>
              )}
              
              {/* User Agent Pattern */}
              {apiKey.user_agent_pattern && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">User Agent Pattern</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {apiKey.user_agent_pattern}
                  </div>
                </div>
              )}
              
              {/* Key Version */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Key Details</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Version: {apiKey.key_version || 1}</div>
                  {apiKey.metadata && Object.keys(apiKey.metadata).length > 0 && (
                    <div className="mt-1">
                      Metadata: {JSON.stringify(apiKey.metadata)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {apiKey.notes && (
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              <div className="font-medium mb-1">Notes</div>
              <p className="text-muted-foreground">{apiKey.notes}</p>
            </div>
          )}
          
          {/* Actions */}
          {apiKey.is_active && !isExpired && !isMaxedOut && (
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteModal(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRotateKey}
                disabled={isRotating}
              >
                {isRotating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rotate Key
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRevokeKey}
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Revoke Key
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRevokeKey}
        title={apiKey.name}
        itemName={apiKey.name}
        itemType="API key"
        isLoading={isRevoking}
      />

      {/* Rotation Confirmation Modal */}
      <ApiKeyRotationModal
        isOpen={showRotationModal}
        onClose={() => setShowRotationModal(false)}
        onConfirm={performRotation}
        apiKey={apiKey}
        isLoading={isRotating}
        onRotationComplete={handleRotationComplete}
      />
    </>
  );
};
import type { FC } from 'react';
import { useState } from 'react';
import { Key, Calendar, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { revokeApiKey } from '../../lib/apiKeyService';
import type { ApiKeyWithResume } from '../../types/apiKeys';

interface ApiKeyCardProps {
  apiKey: ApiKeyWithResume;
  onKeyRevoked: () => void;
}

export const ApiKeyCard: FC<ApiKeyCardProps> = ({ apiKey, onKeyRevoked }) => {
  const [isRevoking, setIsRevoking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
  const isMaxedOut = apiKey.max_uses !== null && apiKey.use_count >= apiKey.max_uses;
  
  // Format the masked key
  const maskedKey = apiKey.key_first_chars && apiKey.key_last_chars 
    ? `${apiKey.key_first_chars}••••••••••••${apiKey.key_last_chars}`
    : '••••••••••••••••••••••••••••••••••••••••';

  return (
    <>
      <Card className={`${apiKey.is_revoked || isExpired || isMaxedOut ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${apiKey.is_admin ? 'bg-amber-100 dark:bg-amber-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                <Key className={`h-5 w-5 ${apiKey.is_admin ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                <CardDescription>
                  {apiKey.is_admin ? 'Admin Key' : 'Standard Key'} • {apiKey.resume?.title || 'All Resumes'}
                </CardDescription>
              </div>
            </div>
            
            {(apiKey.is_revoked || isExpired || isMaxedOut) && (
              <div className="bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 rounded-full">
                {apiKey.is_revoked ? 'Revoked' : isExpired ? 'Expired' : 'Max Uses Reached'}
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
              <div>{apiKey.use_count} calls from {apiKey.unique_ips} IPs</div>
            </div>
          </div>
          
          {/* Max Uses */}
          {apiKey.max_uses !== null && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Usage Limit</span>
                <span className="text-sm">{apiKey.use_count} / {apiKey.max_uses}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${apiKey.is_revoked ? 'bg-gray-400' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (apiKey.use_count / apiKey.max_uses) * 100)}%` }}
                ></div>
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
          {!apiKey.is_revoked && !isExpired && !isMaxedOut && (
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
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRevokeKey}
        title={apiKey.name}
        itemName={apiKey.name}
        itemType="API key"
        isLoading={isRevoking}
      />
    </>
  );
};
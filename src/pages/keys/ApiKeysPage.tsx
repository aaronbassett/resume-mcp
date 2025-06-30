import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Key, Plus, Search, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput } from 'flowbite-react';
import { ApiKeyCard } from '../../components/keys/ApiKeyCard';
import { getUserApiKeys } from '../../lib/apiKeyService';
import type { ApiKeyWithResume } from '../../types/apiKeys';

export const ApiKeysPage: FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyWithResume[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKeyWithResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getUserApiKeys();
      
      if (result.error) {
        setError(result.error);
      } else {
        setApiKeys(result.data || []);
        setFilteredKeys(result.data || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredKeys(apiKeys.filter(key => 
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (key.resume?.title && key.resume.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (key.notes && key.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
    } else {
      setFilteredKeys(apiKeys);
    }
  }, [searchQuery, apiKeys]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyRevoked = () => {
    loadApiKeys();
  };

  // Group keys by active and inactive
  const activeKeys = filteredKeys.filter(key => !key.is_revoked && 
    (!key.expires_at || new Date(key.expires_at) > new Date()) &&
    (key.max_uses === null || key.use_count < key.max_uses)
  );
  
  const inactiveKeys = filteredKeys.filter(key => key.is_revoked || 
    (key.expires_at && new Date(key.expires_at) <= new Date()) ||
    (key.max_uses !== null && key.use_count >= key.max_uses)
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="API Keys"
        description="Manage API keys for accessing your resume data via MCP"
        breadcrumbs={[
          { label: 'API Keys' }
        ]}
        actions={
          <Link to="/keys/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New API Key
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <TextInput
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search API keys..."
            icon={Search}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your API keys...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-destructive mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadApiKeys}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && apiKeys.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="gradient-primary rounded-full p-4 w-fit mx-auto mb-4">
              <Key className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create API keys to allow LLMs and other applications to access your resume data through the Model Context Protocol.
            </p>
            <Link to="/keys/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && !error && apiKeys.length > 0 && filteredKeys.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No API keys found</h3>
            <p className="text-muted-foreground mb-4">
              No API keys match your search for "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Keys */}
      {activeKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Keys ({activeKeys.length})</h3>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {activeKeys.map(key => (
              <ApiKeyCard 
                key={key.id} 
                apiKey={key} 
                onKeyRevoked={handleKeyRevoked} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Keys */}
      {inactiveKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Inactive Keys ({inactiveKeys.length})</h3>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {inactiveKeys.map(key => (
              <ApiKeyCard 
                key={key.id} 
                apiKey={key} 
                onKeyRevoked={handleKeyRevoked} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
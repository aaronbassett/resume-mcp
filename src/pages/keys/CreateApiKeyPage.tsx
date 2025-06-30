import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Key, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ApiKeyForm } from '../../components/keys/ApiKeyForm';
import { ApiKeySuccess } from '../../components/keys/ApiKeySuccess';
import { getUserResumes } from '../../lib/resumeService';
import type { ApiKey } from '../../types/apiKeys';
import type { Resume } from '../../lib/resumeService';

export const CreateApiKeyPage: FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getUserResumes();

        if (result.error) {
          setError(result.error);
        } else {
          setResumes(result.data || []);
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
        setError('Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, []);

  const handleKeyCreated = (key: ApiKey) => {
    setCreatedKey(key);
  };

  const handleDone = () => {
    navigate('/keys');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create API Key"
        description="Generate a new API key to allow access to your resume data"
        breadcrumbs={[
          { label: 'API Keys', href: '/keys' },
          { label: 'Create API Key' }
        ]}
        actions={
          <Link to="/keys">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to API Keys
            </Button>
          </Link>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your resumes...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">{error}</p>
              <p className="text-sm text-destructive/80 mt-1">Please try again or contact support if the issue persists.</p>
            </div>
          </div>
        </div>
      )}

      {/* No Resumes State */}
      {!isLoading && !error && resumes.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <Key className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">No Resumes Available</h3>
          <p className="text-amber-700 dark:text-amber-400 mb-6">
            You need to create at least one resume before you can generate API keys.
          </p>
          <Link to="/resumes/new">
            <Button>
              Create Your First Resume
            </Button>
          </Link>
        </div>
      )}

      {/* Form or Success State */}
      {!isLoading && !error && resumes.length > 0 && (
        <>
          {createdKey ? (
            <ApiKeySuccess apiKey={createdKey} onDone={handleDone} />
          ) : (
            <ApiKeyForm resumes={resumes} onKeyCreated={handleKeyCreated} />
          )}
        </>
      )}
    </div>
  );
};
import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EditableText } from '../components/resume/EditableText';
import { EditableTags } from '../components/resume/EditableTags';
import { AutoSaveIndicator, type SaveStatus } from '../components/resume/AutoSaveIndicator';
import { useResumeStore } from '../store/resume';
import { useAutoSave } from '../hooks/useAutoSave';
import { getResume, updateResume } from '../lib/resumeService';
import type { UpdateResumeData } from '../lib/resumeService';

export const EditResumePage: FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  
  const {
    currentResume,
    hasUnsavedChanges,
    updateTitle,
    updateRole,
    updateDisplayName,
    updateTags,
    setResume,
    setIsNewResume,
    resetResume,
    clearUnsavedChanges
  } = useResumeStore();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load resume data on mount
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await getResume(resumeId);

        if (result.error) {
          if (result.error.includes('No rows returned') || result.error.includes('not found')) {
            setNotFound(true);
          } else {
            setError(result.error);
          }
          setIsLoading(false);
          return;
        }

        if (result.data) {
          // Set the resume data in the store
          setResume({
            id: result.data.id,
            title: result.data.title,
            role: result.data.role,
            displayName: result.data.display_name,
            tags: result.data.tags
          });
          setIsNewResume(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        setError('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();

    // Cleanup on unmount
    return () => {
      resetResume();
    };
  }, [resumeId, setResume, setIsNewResume, resetResume]);

  // Auto-save function
  const handleSave = useCallback(async (data: typeof currentResume) => {
    try {
      if (!data.id) {
        return { error: 'Resume ID is missing' };
      }

      const updateData: UpdateResumeData = {
        title: data.title,
        role: data.role,
        display_name: data.displayName,
        tags: data.tags
      };

      const result = await updateResume(data.id, updateData);
      
      if (result.error) {
        return { error: result.error };
      }

      clearUnsavedChanges();
      return { error: null };
    } catch (error) {
      console.error('Save error:', error);
      return { error: 'Failed to save resume' };
    }
  }, [clearUnsavedChanges]);

  // Set up auto-save - always enabled for existing resumes
  const { manualSave } = useAutoSave({
    data: currentResume,
    onSave: handleSave,
    delay: 1500, // 1.5 second delay
    onStatusChange: setSaveStatus,
    enabled: true // Always enabled for existing resumes
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  // 404 state
  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Resume Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The resume you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button variant="outline" onClick={() => navigate('/resumes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resumes
            </Button>
            <Button onClick={() => navigate('/resumes/new')}>
              Create New Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Resume</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex items-center justify-center space-x-3">
            <Button variant="outline" onClick={() => navigate('/resumes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resumes
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        <PageHeader
          title="Edit Resume"
          description="Make changes to your resume. All changes are automatically saved."
          breadcrumbs={[
            { label: 'Resumes', href: '/resumes' },
            { label: currentResume.title || 'Untitled Resume' }
          ]}
          actions={
            <Button variant="outline" onClick={() => navigate('/resumes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resumes
            </Button>
          }
        />

        {/* Header Section with Auto-save indicator */}
        <Card>
          <CardContent className="p-8 pt-12 relative">
            {/* Auto-save indicator positioned in top right of header */}
            <div className="absolute top-4 right-4">
              <AutoSaveIndicator 
                status={saveStatus} 
                onRetry={manualSave}
              />
            </div>

            <div className="space-y-2">
              {/* Resume Title */}
              <div>
                <EditableText
                  value={currentResume.title}
                  placeholder="Untitled Resume"
                  onSave={updateTitle}
                  as="h1"
                  className="text-4xl font-bold leading-tight w-full"
                />
              </div>

              {/* Role */}
              <div>
                <EditableText
                  value={currentResume.role}
                  placeholder="Click to Edit Role"
                  onSave={updateRole}
                  as="h2"
                  className="text-2xl font-semibold text-muted-foreground leading-tight w-full"
                />
              </div>

              {/* Display Name */}
              <div>
                <EditableText
                  value={currentResume.displayName}
                  placeholder="Click to Edit Display Name"
                  onSave={updateDisplayName}
                  as="p"
                  className="text-lg italic text-muted-foreground leading-tight w-full"
                />
              </div>

              {/* Tags */}
              <div className="pt-2">
                <EditableTags
                  tags={currentResume.tags}
                  onTagsChange={updateTags}
                  placeholder="Click to Add Tags"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Builder Section - Placeholder for future development */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
              <p className="text-muted-foreground">
                Content builder with blocks will be implemented here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};
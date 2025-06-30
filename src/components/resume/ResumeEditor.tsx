import { FC, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, AlertCircle, ChevronDown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { EditableText } from './EditableText';
import { EditableTags } from './EditableTags';
import { AutoSaveIndicator, type SaveStatus } from './AutoSaveIndicator';
import { ResumeSettingsDrawer, type ResumeSettings } from './ResumeSettingsDrawer';
import { useResumeStore } from '../../store/resume';
import { useAutoSave } from '../../hooks/useAutoSave';
import { createResume, updateResume, getResume, updateResumeSettings } from '../../lib/resumeService';
import type { CreateResumeData, UpdateResumeData } from '../../lib/resumeService';

interface ResumeEditorProps {
  resumeId?: string;
  isNew?: boolean;
  onBack?: () => void;
}

export const ResumeEditor: FC<ResumeEditorProps> = ({ 
  resumeId,
  isNew = false,
  onBack
}) => {
  const navigate = useNavigate();
  
  const {
    currentResume,
    isNewResume,
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
  const [isLoading, setIsLoading] = useState(isNew ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [resumeSettings, setResumeSettings] = useState<ResumeSettings>({
    publishResumePage: true,
    presenceBadge: 'none',
    enableResumeDownloads: true,
    resumePageTemplate: 'standard',
    allowUsersSwitchTemplate: false,
    visibility: 'public',
    
    enableMischiefMode: false,
    includeCustomMischief: false,
    customMischiefInstructions: '',
    attemptAvoidDetection: false,
    embedLLMInstructions: true,
    
    urlSlug: '',
    metaTitle: '',
    metaDescription: '',
    robotsDirectives: ['index', 'follow']
  });

  // Load resume data on mount if editing an existing resume
  useEffect(() => {
    if (isNew) {
      resetResume();
      setIsNewResume(true);
      return;
    }

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
          
          // Set settings from individual columns (no more nested settings object)
          setResumeSettings({
            publishResumePage: result.data.publish_resume_page ?? true,
            presenceBadge: result.data.presence_badge ?? 'none',
            enableResumeDownloads: result.data.enable_resume_downloads ?? true,
            resumePageTemplate: result.data.resume_page_template ?? 'standard',
            allowUsersSwitchTemplate: result.data.allow_users_switch_template ?? false,
            visibility: result.data.visibility ?? 'public',
            
            enableMischiefMode: result.data.enable_mischief_mode ?? false,
            includeCustomMischief: result.data.include_custom_mischief ?? false,
            customMischiefInstructions: result.data.custom_mischief_instructions ?? '',
            attemptAvoidDetection: result.data.attempt_avoid_detection ?? false,
            embedLLMInstructions: result.data.embed_llm_instructions ?? true,
            
            urlSlug: result.data.slug || '',
            metaTitle: result.data.meta_title ?? '',
            metaDescription: result.data.meta_description ?? '',
            robotsDirectives: result.data.robots_directives ?? ['index', 'follow']
          });
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
  }, [resumeId, isNew, setResume, setIsNewResume, resetResume]);

  // Auto-save function
  const handleSave = useCallback(async (data: typeof currentResume) => {
    try {
      if (isNewResume) {
        // Create new resume
        const createData: CreateResumeData = {
          title: data.title,
          role: data.role,
          display_name: data.displayName,
          tags: data.tags
        };

        const result = await createResume(createData);
        
        if (result.error) {
          return { error: result.error };
        }

        if (result.data) {
          // Update store with the created resume data
          setResume({
            id: result.data.id,
            title: result.data.title,
            role: result.data.role,
            displayName: result.data.display_name,
            tags: result.data.tags
          });
          setIsNewResume(false);
          clearUnsavedChanges();

          // Set URL slug from the created resume
          setResumeSettings(prev => ({
            ...prev,
            urlSlug: result.data.slug || ''
          }));

          // Update URL to edit route without navigation/refresh
          const newUrl = `/resumes/${result.data.id}/edit`;
          window.history.replaceState(null, '', newUrl);
        }

        return { error: null };
      } else {
        // Update existing resume
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
      }
    } catch (error) {
      console.error('Save error:', error);
      return { error: 'Failed to save resume' };
    }
  }, [isNewResume, setResume, setIsNewResume, clearUnsavedChanges]);

  // Set up auto-save
  const { manualSave } = useAutoSave({
    data: currentResume,
    onSave: handleSave,
    delay: 1500, // 1.5 second delay
    onStatusChange: setSaveStatus,
    enabled: isNew ? hasUnsavedChanges : true // Only enable auto-save after user makes changes for new resumes
  });

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/resumes');
    }
  };

  const handleSaveSettings = async (newSettings: ResumeSettings) => {
    setResumeSettings(newSettings);
    
    // Only save settings if we have a resume ID
    if (currentResume.id) {
      try {
        setSaveStatus('saving');
        const result = await updateResumeSettings(currentResume.id, newSettings);
        
        if (result.error) {
          console.error('Error saving settings:', result.error);
          setSaveStatus('error');
        } else {
          setSaveStatus('saved');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        setSaveStatus('error');
      }
    }
    
    setIsAdvancedSettingsOpen(false);
  };

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
  if (notFound && !isNew) {
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
            <Button variant="outline" onClick={handleBackClick}>
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
            <Button variant="outline" onClick={handleBackClick}>
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

            <div className="space-y-2 pb-6">
              {/* Resume Title */}
              <div>
                <EditableText
                  value={currentResume.title}
                  placeholder="Untitled Resume"
                  onSave={updateTitle}
                  as="h1"
                  className="text-4xl font-bold leading-tight w-full"
                  llmOptions={{
                    additionalContext: [
                      'The user is updating the Resume Title form field. The placeholder for this field is "Untitled Resume".',
                      JSON.stringify({
                        "other_fields": {
                          "role": currentResume.role,
                          "user's display name": currentResume.displayName,
                          "tags": currentResume.tags
                        }
                      })
                    ]
                  }}
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
                  llmOptions={{
                    additionalContext: [
                      'The user is updating the Role form field.',
                      JSON.stringify({
                        "other_fields": {
                          "resume title": currentResume.title,
                          "user's display name": currentResume.displayName,
                          "tags": currentResume.tags
                        }
                      })
                    ]
                  }}
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

            {/* Status indicator for new resumes */}
            {isNewResume && !hasUnsavedChanges && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Draft Mode:</strong> This resume will be saved automatically once you start editing any field.
                </p>
              </div>
            )}

            {/* Advanced Settings Toggle - Only show for non-new resumes */}
            {!isNewResume && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Advanced Settings</span>
                  <ChevronDown 
                    className={`ml-2 h-4 w-4 transition-transform ${isAdvancedSettingsOpen ? 'rotate-180' : ''}`} 
                  />
                </Button>
              </div>
            )}
          </CardContent>

          {/* Advanced Settings Drawer */}
          <AnimatePresence>
            {isAdvancedSettingsOpen && (
              <ResumeSettingsDrawer
                isOpen={isAdvancedSettingsOpen}
                onClose={() => setIsAdvancedSettingsOpen(false)}
                onSave={handleSaveSettings}
                initialSettings={resumeSettings}
                resumeId={currentResume.id}
              />
            )}
          </AnimatePresence>
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
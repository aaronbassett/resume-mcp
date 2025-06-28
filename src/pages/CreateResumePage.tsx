import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { EditableText } from '../components/resume/EditableText';
import { EditableTags } from '../components/resume/EditableTags';
import { AutoSaveIndicator, type SaveStatus } from '../components/resume/AutoSaveIndicator';
import { useResumeStore } from '../store/resume';
import { useAutoSave } from '../hooks/useAutoSave';
import { createResume, updateResume } from '../lib/resumeService';
import type { CreateResumeData, UpdateResumeData } from '../lib/resumeService';

export const CreateResumePage: FC = () => {
  const {
    currentResume,
    isNewResume,
    updateTitle,
    updateRole,
    updateDisplayName,
    updateTags,
    setResume,
    setIsNewResume
  } = useResumeStore();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

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

        return { error: null };
      }
    } catch (error) {
      console.error('Save error:', error);
      return { error: 'Failed to save resume' };
    }
  }, [isNewResume, setResume, setIsNewResume]);

  // Set up auto-save
  const { manualSave } = useAutoSave({
    data: currentResume,
    onSave: handleSave,
    delay: 1500, // 1.5 second delay
    onStatusChange: setSaveStatus
  });

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
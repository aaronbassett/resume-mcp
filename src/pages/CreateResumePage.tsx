import type { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { EditableText } from '../components/resume/EditableText';
import { EditableTags } from '../components/resume/EditableTags';
import { useResumeStore } from '../store/resume';

export const CreateResumePage: FC = () => {
  const {
    currentResume,
    updateTitle,
    updateRole,
    updateDisplayName,
    updateTags
  } = useResumeStore();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        <PageHeader
          title="Create New Resume"
          description="Build your AI-powered resume with modular blocks."
          breadcrumbs={[
            { label: 'Resumes', href: '/resumes' },
            { label: 'New Resume' }
          ]}
        />

        {/* Header Section */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Resume Title */}
              <div>
                <EditableText
                  value={currentResume.title}
                  placeholder="Untitled Resume"
                  onSave={updateTitle}
                  as="h1"
                  className="text-4xl font-bold"
                />
              </div>

              {/* Role */}
              <div>
                <EditableText
                  value={currentResume.role}
                  placeholder="Click to edit role"
                  onSave={updateRole}
                  as="h2"
                  className="text-2xl font-semibold text-muted-foreground"
                />
              </div>

              {/* Display Name */}
              <div>
                <EditableText
                  value={currentResume.displayName}
                  placeholder="Click to edit display name"
                  onSave={updateDisplayName}
                  as="p"
                  className="text-lg italic text-muted-foreground"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <EditableTags
                  tags={currentResume.tags}
                  onTagsChange={updateTags}
                  placeholder="Click to add tags"
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
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { ResumeEditor } from '../components/resume/ResumeEditor';
import { useResumeStore } from '../store/resume';

export const EditResumePage: FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const { currentResume } = useResumeStore();

  return (
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

      <ResumeEditor resumeId={resumeId} onBack={() => navigate('/resumes')} />
    </div>
  );
};
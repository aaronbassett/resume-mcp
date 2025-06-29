import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResumeEditor } from '../components/resume/ResumeEditor';

export const CreateResumePage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create Resume"
        description="Create a new AI-powered resume. All changes are automatically saved."
        breadcrumbs={[
          { label: 'Resumes', href: '/resumes' },
          { label: 'Create Resume' }
        ]}
      />

      <ResumeEditor isNew={true} onBack={() => navigate('/resumes')} />
    </div>
  );
};
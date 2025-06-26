import type { FC } from 'react';
import { Plus, Search, Filter, Eye, Edit, BarChart3, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../components/ui/BorderBottomBeam';

const resumes = [
  {
    id: '1',
    title: 'Full Stack Developer',
    description: 'Comprehensive resume showcasing full-stack development skills',
    views: 234,
    apiCalls: 45,
    lastModified: '2 hours ago',
    status: 'active',
    blocks: 8,
  },
  {
    id: '2',
    title: 'Frontend Specialist',
    description: 'Frontend-focused resume highlighting React and TypeScript expertise',
    views: 156,
    apiCalls: 23,
    lastModified: '1 day ago',
    status: 'active',
    blocks: 6,
  },
  {
    id: '3',
    title: 'Senior React Engineer',
    description: 'Senior-level resume emphasizing React ecosystem leadership',
    views: 89,
    apiCalls: 12,
    lastModified: '3 days ago',
    status: 'draft',
    blocks: 5,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    description: 'Infrastructure and DevOps focused professional profile',
    views: 67,
    apiCalls: 8,
    lastModified: '1 week ago',
    status: 'active',
    blocks: 7,
  },
];

export const ResumesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Resumes"
        description="Manage your AI-powered resumes and track their performance."
        breadcrumbs={[
          { label: 'Resumes' }
        ]}
        actions={
          <Link to="/resumes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-end space-x-4">
       <div className="relative">
                  <BorderBottomBeam 
                    play={emailFocused}
                    className="rounded-md"
                    colorFrom="#6366f1"
                    colorTo="#ec4899"
                    duration={2}
                    size={60}
                  >
                      <TextInput
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search Resumes"
                        icon={Search}
                        color="search"
                        sizing="full"
                      />
                  </BorderBottomBeam>
                </div>
        <Button variant="outline" className="h-12 px-4">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Resumes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} hover>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{resume.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resume.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {resume.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {resume.blocks} blocks
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{resume.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{resume.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{resume.apiCalls} API calls</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Updated {resume.lastModified}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Link to={`/resumes/${resume.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/resumes/${resume.id}/analytics`}>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for New Users */}
      {resumes.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="gradient-primary rounded-full p-4 w-fit mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first AI-powered resume. You can use blocks to build modular, reusable content.
            </p>
            <Link to="/resumes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
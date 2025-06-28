import { type FC, useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, BarChart3, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../components/ui/BorderBottomBeam';
import { SparklesText } from '../components/ui/SparklesText';
import { getUserResumes, deleteResume } from '../lib/resumeService';
import type { Resume } from '../lib/resumeService';

export const ResumesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isNewResumeHovered, setIsNewResumeHovered] = useState(false);
  const [isCreateFirstResumeHovered, setIsCreateFirstResumeHovered] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load user's resumes
  useEffect(() => {
    loadResumes();
  }, []);

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

  // Handle resume deletion
  const handleDeleteResume = async (resumeId: string, resumeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(resumeId);
      const result = await deleteResume(resumeId);

      if (result.error) {
        alert(`Failed to delete resume: ${result.error}`);
      } else {
        // Remove the deleted resume from the list
        setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle resume duplication
  const handleDuplicateResume = async (resume: Resume) => {
    // TODO: Implement resume duplication
    alert('Resume duplication will be implemented soon!');
  };

  // Filter resumes based on search query
  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

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
            <Button
              variant="fluid-accent"
              onMouseEnter={() => setIsNewResumeHovered(true)}
              onMouseLeave={() => setIsNewResumeHovered(false)}
            >
              <Plus className="mr-2 h-4 w-4" />
              <SparklesText enabled={isNewResumeHovered} sparkleColor="#ffffff">
                New Resume
              </SparklesText>
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="flex items-end space-x-4">
        <div className="relative w-full">
          <BorderBottomBeam 
            play={searchFocused}
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadResumes}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State for New Users */}
      {!isLoading && !error && resumes.length === 0 && (
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
              <Button
                variant="fluid-accent"
                onMouseEnter={() => setIsCreateFirstResumeHovered(true)}
                onMouseLeave={() => setIsCreateFirstResumeHovered(false)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <SparklesText enabled={isCreateFirstResumeHovered} sparkleColor="#ffffff">
                  Create Your First Resume
                </SparklesText>
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && !error && resumes.length > 0 && filteredResumes.length === 0 && searchQuery && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No resumes found</h3>
            <p className="text-muted-foreground mb-4">
              No resumes match your search for "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumes Grid */}
      {!isLoading && !error && filteredResumes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume) => (
            <Card key={resume.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        active
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {resume.tags.length} tags
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Duplicate Resume"
                    onClick={() => handleDuplicateResume(resume)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {resume.role || resume.display_name || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>0 views</span> {/* TODO: Add view tracking */}
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>0 API calls</span> {/* TODO: Add API call tracking */}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Updated {formatTimeAgo(resume.updated_at)}
                  </div>

                  {/* Tags */}
                  {resume.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resume.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tag.text}
                        </span>
                      ))}
                      {resume.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          +{resume.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Link to={`/r/user/${resume.slug}`}>
                        <Button variant="ghost" size="sm" title="View Resume">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit Resume">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/analytics`}>
                        <Button variant="ghost" size="sm" title="View Analytics">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive" 
                      title="Delete Resume"
                      onClick={() => handleDeleteResume(resume.id, resume.title)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
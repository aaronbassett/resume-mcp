import { type FC, useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, BarChart3, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../components/ui/BorderBottomBeam';
import { SparklesText } from '../components/ui/SparklesText';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { FilterDrawer } from '../components/ui/FilterDrawer';
import { getUserResumes, deleteResume } from '../lib/resumeService';
import type { Resume } from '../lib/resumeService';

interface FilterOptions {
  dateRange: 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_year';
  tags: string[];
  sortBy: 'updated' | 'created' | 'title' | 'views';
  sortOrder: 'asc' | 'desc';
  status: 'all' | 'active' | 'draft' | 'archived';
}

export const ResumesPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isNewResumeHovered, setIsNewResumeHovered] = useState(false);
  const [isCreateFirstResumeHovered, setIsCreateFirstResumeHovered] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    tags: [],
    sortBy: 'updated',
    sortOrder: 'desc',
    status: 'all'
  });
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    resume: Resume | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    resume: null,
    isDeleting: false
  });

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

  // Handle opening delete modal
  const handleDeleteClick = (resume: Resume) => {
    setDeleteModal({
      isOpen: true,
      resume,
      isDeleting: false
    });
  };

  // Handle closing delete modal
  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        resume: null,
        isDeleting: false
      });
    }
  };

  // Handle confirmed deletion
  const handleDeleteConfirm = async () => {
    if (!deleteModal.resume) return;

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      const result = await deleteResume(deleteModal.resume.id);

      if (result.error) {
        alert(`Failed to delete resume: ${result.error}`);
      } else {
        // Remove the deleted resume from the list
        setResumes(prev => prev.filter(resume => resume.id !== deleteModal.resume!.id));
        
        // Close modal
        setDeleteModal({
          isOpen: false,
          resume: null,
          isDeleting: false
        });
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Handle resume duplication
  const handleDuplicateResume = async (resume: Resume) => {
    // TODO: Implement resume duplication
    alert('Resume duplication will be implemented soon!');
  };

  // Get all unique tags from resumes
  const availableTags = Array.from(
    new Set(resumes.flatMap(resume => resume.tags.map(tag => tag.text)))
  );

  // Apply filters and search to resumes
  const getFilteredAndSortedResumes = () => {
    let filtered = resumes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(resume =>
        resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.tags.some(tag => tag.text.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'last_month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(resume => 
        new Date(resume.updated_at) >= cutoffDate
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(resume =>
        filters.tags.some(filterTag =>
          resume.tags.some(resumeTag => resumeTag.text === filterTag)
        )
      );
    }

    // Apply status filter (for now, all resumes are considered 'active')
    if (filters.status !== 'all') {
      // TODO: Implement status filtering when status field is added to resume schema
      // For now, we'll treat all resumes as 'active'
      if (filters.status !== 'active') {
        filtered = [];
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          // TODO: Implement view count when analytics are added
          comparison = 0;
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredResumes = getFilteredAndSortedResumes();

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
      <div className="space-y-4">
        <div className="flex items-end space-x-4">
          <div className="relative flex-1">
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
          
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-12 px-4 relative"
          >
            <div className="flex items-center space-x-2">
              <span>Filter</span>
              {Object.values(filters).some(val => 
                Array.isArray(val) ? val.length > 0 : val !== 'all' && val !== 'updated' && val !== 'desc'
              ) && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <motion.div
                animate={{ rotate: isFilterOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </div>
          </Button>
        </div>
        
        {/* Embedded Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full bg-background/80 dark:bg-background/40 rounded-lg border shadow-inner overflow-hidden"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filter Resumes</h3>
                  <div className="flex items-center space-x-2">
                    {Object.values(filters).some(val => 
                      Array.isArray(val) ? val.length > 0 : val !== 'all' && val !== 'updated' && val !== 'desc'
                    ) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters({
                          dateRange: 'all',
                          tags: [],
                          sortBy: 'updated',
                          sortOrder: 'desc',
                          status: 'all'
                        })}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Filter Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date Range</span>
                    </label>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    >
                      <option value="all">All Time</option>
                      <option value="last_week">Last Week</option>
                      <option value="last_month">Last Month</option>
                      <option value="last_3_months">Last 3 Months</option>
                      <option value="last_year">Last Year</option>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Status</span>
                    </label>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="all">All Resumes</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Sort By</span>
                    </label>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    >
                      <option value="updated">Last Updated</option>
                      <option value="created">Date Created</option>
                      <option value="title">Title</option>
                      <option value="views">View Count</option>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </Select>
                  </div>
                </div>

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                      {filters.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({filters.tags.length} selected)
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = filters.tags.includes(tag)
                              ? filters.tags.filter(t => t !== tag)
                              : [...filters.tags, tag];
                            setFilters(prev => ({ ...prev, tags: newTags }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filters.tags.includes(tag)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Filters Summary */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        const activeCount = [
                          filters.dateRange !== 'all',
                          filters.tags.length > 0,
                          filters.sortBy !== 'updated' || filters.sortOrder !== 'desc',
                          filters.status !== 'all'
                        ].filter(Boolean).length;
                        
                        return `${activeCount} filter${activeCount !== 1 ? 's' : ''} active`;
                      })()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      {!isLoading && !error && resumes.length > 0 && filteredResumes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No resumes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No resumes match your search for "${searchQuery}"`
                : 'No resumes match your current filters'
              }
            </p>
            <div className="flex items-center justify-center space-x-3">
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setFilters({
                  dateRange: 'all',
                  tags: [],
                  sortBy: 'updated',
                  sortOrder: 'desc',
                  status: 'all'
                });
                setSearchQuery('');
              }}>
                Clear All Filters
              </Button>
            </div>
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
                  <button 
                    className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center" 
                    title="Duplicate Resume"
                    onClick={() => handleDuplicateResume(resume)}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
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
                        <button className="h-8 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center text-sm font-medium" title="View Resume">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/edit`}>
                        <button className="h-8 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center text-sm font-medium" title="Edit Resume">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/analytics`}>
                        <button className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center" title="View Analytics">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                    <button 
                      className="h-8 w-8 p-0 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 flex items-center justify-center" 
                      title="Delete Resume"
                      onClick={() => handleDeleteClick(resume)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteModal.resume?.title || ''}
        itemName={deleteModal.resume?.title || ''}
        itemType="resume"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};
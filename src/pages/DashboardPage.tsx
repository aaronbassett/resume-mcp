import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, BarChart3, Users, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SparklesText } from '../components/ui/SparklesText';
import { getUserResumes } from '../lib/resumeService';
import type { Resume } from '../lib/resumeService';

const stats = [
  { name: 'Total Views', value: '2,847', change: '+12%', trend: 'up' },
  { name: 'Active Resumes', value: '6', change: '+2', trend: 'up' },
  { name: 'API Calls', value: '1,234', change: '+23%', trend: 'up' },
  { name: 'Conversion Rate', value: '4.2%', change: '+0.8%', trend: 'up' },
];

const recentActivity = [
  { action: 'Resume viewed by GPT-4', target: 'Full Stack Developer', time: '5 minutes ago' },
  { action: 'New API key generated', target: 'Claude Integration', time: '1 hour ago' },
  { action: 'Block updated', target: 'Experience: Senior Engineer', time: '2 hours ago' },
  { action: 'Resume shared', target: 'Frontend Specialist', time: '4 hours ago' },
];

export const DashboardPage: FC = () => {
  const [isNewResumeHovered, setIsNewResumeHovered] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's resumes
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
          // Update active resumes count in stats
          stats[1].value = (result.data || []).length.toString();
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

  // Get recent resumes (last 3)
  const recentResumes = resumes.slice(0, 3);

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
        title="Dashboard"
        description="Welcome back! Here's an overview of your Resume MCP activity."
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

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resumes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Resumes</CardTitle>
                <CardDescription>Your most recently updated resumes</CardDescription>
              </div>
              <Link to="/resumes">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive text-sm">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : recentResumes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No resumes yet</p>
                <Link to="/resumes/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{resume.title}</h4>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          active
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          0 views {/* TODO: Add view tracking */}
                        </span>
                        <span>Updated {formatTimeAgo(resume.updated_at)}</span>
                      </div>
                      {resume.role && (
                        <p className="text-sm text-muted-foreground">{resume.role}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/r/user/${resume.slug}`}>
                        <button className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center" title="View Resume">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/edit`}>
                        <button className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center" title="Edit Resume">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link to={`/resumes/${resume.id}/analytics`}>
                        <button className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 flex items-center justify-center" title="View Analytics">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions with your resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="gradient-primary rounded-full p-2">
                    <Zap className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.target}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/resumes/new">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="gradient-primary rounded-lg p-2">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Create Resume</h4>
                  <p className="text-sm text-muted-foreground">Start with a new resume</p>
                </div>
              </div>
            </Link>
            
            <Link to="/blocks">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="gradient-secondary rounded-lg p-2">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Manage Blocks</h4>
                  <p className="text-sm text-muted-foreground">Organize your content</p>
                </div>
              </div>
            </Link>

            <Link to="/analytics">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="bg-green-500 rounded-lg p-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-muted-foreground">Track performance</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
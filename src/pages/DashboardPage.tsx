import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Eye, Edit, BarChart3, Users, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SparklesText } from '../components/ui/SparklesText';

const stats = [
  { name: 'Total Views', value: '2,847', change: '+12%', trend: 'up' },
  { name: 'Active Resumes', value: '6', change: '+2', trend: 'up' },
  { name: 'API Calls', value: '1,234', change: '+23%', trend: 'up' },
  { name: 'Conversion Rate', value: '4.2%', change: '+0.8%', trend: 'up' },
];

const recentResumes = [
  {
    id: '1',
    title: 'Full Stack Developer',
    views: 234,
    lastModified: '2 hours ago',
    status: 'active',
  },
  {
    id: '2',
    title: 'Frontend Specialist',
    views: 156,
    lastModified: '1 day ago',
    status: 'active',
  },
  {
    id: '3',
    title: 'Senior React Engineer',
    views: 89,
    lastModified: '3 days ago',
    status: 'draft',
  },
];

const recentActivity = [
  { action: 'Resume viewed by GPT-4', target: 'Full Stack Developer', time: '5 minutes ago' },
  { action: 'New API key generated', target: 'Claude Integration', time: '1 hour ago' },
  { action: 'Block updated', target: 'Experience: Senior Engineer', time: '2 hours ago' },
  { action: 'Resume shared', target: 'Frontend Specialist', time: '4 hours ago' },
];

export const DashboardPage: FC = () => {
  const [isNewResumeHovered, setIsNewResumeHovered] = useState(false);

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
            <div className="space-y-4">
              {recentResumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{resume.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resume.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {resume.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {resume.views} views
                      </span>
                      <span>Updated {resume.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/resumes/${resume.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/resumes/${resume.id}/analytics`}>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
import type { FC } from 'react';
import { Plus, Search, Filter, Edit, Copy, Trash2, Briefcase, GraduationCap, Code, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const blockTypes = [
  { name: 'Experience', icon: Briefcase, count: 12, color: 'bg-blue-500' },
  { name: 'Education', icon: GraduationCap, count: 3, color: 'bg-green-500' },
  { name: 'Skills', icon: Code, count: 8, color: 'bg-purple-500' },
  { name: 'Awards', icon: Award, count: 5, color: 'bg-orange-500' },
];

const recentBlocks = [
  {
    id: '1',
    name: 'Senior Full Stack Engineer at TechCorp',
    type: 'experience',
    icon: Briefcase,
    lastModified: '2 hours ago',
    usedIn: 3,
    description: '5+ years leading full-stack development teams and architecting scalable solutions.',
  },
  {
    id: '2',
    name: 'React & TypeScript Expertise',
    type: 'skill',
    icon: Code,
    lastModified: '1 day ago',
    usedIn: 5,
    description: 'Advanced proficiency in React ecosystem, TypeScript, and modern frontend development.',
  },
  {
    id: '3',
    name: 'Computer Science Degree - MIT',
    type: 'education',
    icon: GraduationCap,
    lastModified: '3 days ago',
    usedIn: 6,
    description: 'Bachelor of Science in Computer Science, Massachusetts Institute of Technology.',
  },
  {
    id: '4',
    name: 'Best Developer Award 2024',
    type: 'award',
    icon: Award,
    lastModified: '1 week ago',
    usedIn: 2,
    description: 'Recognition for outstanding contribution to open-source projects and team leadership.',
  },
];

export const BlocksPage: FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Block Library"
        description="Manage your reusable content blocks. Create once, use everywhere across your resumes."
        breadcrumbs={[
          { label: 'Blocks' }
        ]}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Block
          </Button>
        }
      />

      {/* Block Types Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {blockTypes.map((type) => (
          <Link key={type.name} to={`/blocks/${type.name.toLowerCase()}`}>
            <Card hover className="cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type.name}</CardTitle>
                <div className={`${type.color} rounded-lg p-2`}>
                  <type.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{type.count}</div>
                <p className="text-xs text-muted-foreground">
                  blocks available
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search blocks..."
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blocks</CardTitle>
          <CardDescription>Your most recently updated content blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBlocks.map((block) => (
              <div key={block.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="gradient-primary rounded-lg p-2">
                  <block.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{block.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Link to={`/blocks/${block.type}/${block.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>Used in {block.usedIn} resumes</span>
                    <span>•</span>
                    <span>Updated {block.lastModified}</span>
                    <span>•</span>
                    <span className="capitalize">{block.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Blocks</CardTitle>
          <CardDescription>Learn how to make the most of your block library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">1. Create Reusable Content</h4>
              <p className="text-sm text-muted-foreground">
                Build blocks for experiences, skills, projects, and more. Each block can be used across multiple resumes.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Organize by Type</h4>
              <p className="text-sm text-muted-foreground">
                Categorize your blocks by type to keep your library organized and easy to navigate.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Update Once, Apply Everywhere</h4>
              <p className="text-sm text-muted-foreground">
                When you update a block, the changes automatically apply to all resumes using that block.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
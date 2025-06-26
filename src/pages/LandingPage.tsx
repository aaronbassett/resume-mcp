import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Shield, BarChart3, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { SwitchRevealHeading } from '../components/ui/SwitchRevealHeading';
import { useAuthStore } from '../store/auth';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Profiles',
    description: 'Your resume becomes an intelligent agent that LLMs can query and understand.',
  },
  {
    icon: Zap,
    title: 'Block-Based System',
    description: 'Build modular resumes using reusable blocks - write once, use everywhere.',
  },
  {
    icon: Shield,
    title: 'Privacy Control',
    description: 'Control what each API key exposes and track who accesses your data.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Know which parts of your profile get attention and which LLMs check you out.',
  },
  {
    icon: Globe,
    title: 'API Integration',
    description: 'Share with ChatGPT, Claude, or any LLM via Model Context Protocol (MCP).',
  },
  {
    icon: Users,
    title: 'Dynamic Targeting',
    description: 'Create different resume views for different opportunities from the same blocks.',
  },
];

const auroraTexts = [
  'an AI Career Coach',
  'Your Virtual Talent Agent',
  'a Smart Career Ally',
  'a Smart Negotiator',
  'Your Personal Career Agent',
  'Your Digital Representative',
  'Your AI Advocate',
];

export const LandingPage: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="gradient-primary rounded-lg p-2">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Resume MCP</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Profiles</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SwitchRevealHeading
                headingText="Turn Your Resume into"
                auroraTexts={auroraTexts}
                className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                pauseDuration={24000}
                fadeDuration={0.3}
              />
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
                Create dynamic, AI-powered professional profiles that LLMs can actually understand and interact with. 
                Instead of static PDFs, build modular resumes that negotiate on your behalf.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="text-lg px-8">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Start Building <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/demo" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
                  View Demo <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to land your dream job
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Turn your resume into a smart API that helps you land better opportunities while you sleep.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-7xl">
            <motion.div 
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {features.map((feature, index) => (
                <Card key={index} hover className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-primary rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to supercharge your career?
            </h2>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of developers who are already using Resume MCP to land better opportunities.
            </p>
            <div className="mt-10">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <p>&copy; 2025 Resume MCP. All rights reserved. Made with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Shield, BarChart3, Globe, Users } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { SwitchRevealHeading } from '../components/ui/SwitchRevealHeading';
import { BackgroundBeams } from '../components/ui/BackgroundBeams';
import { GlowingEffect } from '../components/ui/GlowingEffect';
import { TextReveal } from '../components/ui/TextReveal';
import { ParallaxText, VelocityScroll } from '../components/ui/ParallaxText';
import { PointerHighlight } from '../components/ui/PointerHighlight';
import { Spotlight } from '../components/ui/Spotlight';
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
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isStartBuildingHovered, setIsStartBuildingHovered] = useState(false);
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  // Feature cards animation
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // CTA section animation
  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50">
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
                    <Button variant="fluid-secondary">
                      Dashboard
                    </Button>
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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <BackgroundBeams className="opacity-40" />
        <Spotlight />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-32">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            style={{ opacity, scale }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SwitchRevealHeading
                headingText="Turn Your Resume into"
                auroraTexts={auroraTexts}
                className="text-6xl font-extrabold tracking-tight leading-tight"
                pauseDuration={6000}
                fadeDuration={0.3}
              />
              <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Create dynamic, AI-powered professional profiles that LLMs can actually understand and interact with. 
                Instead of static PDFs, build modular resumes that negotiate on your behalf.
              </p>
              <div className="mt-16 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" variant="fluid-secondary" className="text-lg px-8 py-6">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth/signup">
                    <PointerHighlight 
                      rectangleClassName="bg-primary/10 border-primary/30"
                      pointerClassName="text-primary"
                    >
                      <Button 
                        size="lg" 
                        className="text-xl px-10 py-7"
                        onMouseEnter={() => setIsStartBuildingHovered(true)}
                        onMouseLeave={() => setIsStartBuildingHovered(false)}
                      >
                        Start Building <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </PointerHighlight>
                  </Link>
                )}
                
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Scrolling Text */}
      <section className="py-16 overflow-hidden">
        <div className="opacity-25">
          <VelocityScroll defaultVelocity={3} className="text-9xl font-bold opacity-20">
            AI-POWERED RESUMES • INTELLIGENT AGENTS • CAREER ACCELERATION • SMART PROFILES •
          </VelocityScroll>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
              Everything you need to land your dream job
            </h2>
            <p className="text-xl leading-8 text-muted-foreground">
              Turn your resume into a smart API that helps you land better opportunities while you sleep.
            </p>
          </div>
          
          <motion.div 
            ref={featuresRef}
            className="mx-auto mt-16 max-w-7xl"
          >
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="h-full">
                    <GlowingEffect disabled={false} />
                    <CardHeader>
                      <div className="mx-auto w-14 h-14 gradient-primary rounded-lg flex items-center justify-center mb-6">
                        <feature.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-lg">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Text Reveal Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TextReveal className="text-5xl md:text-6xl font-bold">
            Create intelligent resume agents that work 24/7 to land you better opportunities. Your professional profile becomes an AI-powered advocate.
          </TextReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-32 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <PointerHighlight
                rectangleClassName="bg-primary/10 border-primary/30"
                pointerClassName="text-primary"
              >
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-50 mb-6">
                  Ready to supercharge your career?
                </h2>
              </PointerHighlight>
              <p className="mt-6 text-base leading-8 text-muted-foreground max-w-2xl mx-auto hidden md:block">
                Join thousands of developers who are already using Resume MCP to land better opportunities.
              </p>
              <div className="mt-12">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button 
                      size="lg" 
                      className="text-xl px-10 py-7 relative overflow-hidden animate-aurora"
                      style={{
                        background: 'linear-gradient(90deg, hsl(var(--color-1)), hsl(var(--color-2)), hsl(var(--color-3)), hsl(var(--color-4)), hsl(var(--color-5)))',
                        backgroundSize: '400% 400%',
                      }}
                    >
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth/signup">
                    <Button 
                      size="lg" 
                      className="text-xl px-10 py-7 relative overflow-hidden animate-aurora"
                      style={{
                        background: 'linear-gradient(90deg, hsl(var(--color-1)), hsl(var(--color-2)), hsl(var(--color-3)), hsl(var(--color-4)), hsl(var(--color-5)))',
                        backgroundSize: '400% 400%',
                      }}
                    >
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Trusted by developers worldwide
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              See what others are saying about Resume MCP
            </p>
          </div>
          
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array(5).fill(0).map((_, j) => (
                      <svg key={j} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xl mb-6">
                    "Resume MCP has completely transformed my job search. The AI integration is seamless and the analytics provide invaluable insights."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Jane Developer</p>
                      <p className="text-muted-foreground">Senior Engineer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity mb-6">
                <div className="gradient-primary rounded-lg p-2">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Resume MCP</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Profiles</p>
                </div>
              </Link>
              <p className="text-lg text-muted-foreground">
                Transforming resumes into intelligent agents that work for you 24/7.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Product</h3>
              <ul className="space-y-3 text-lg">
                <li><Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="/demo" className="text-muted-foreground hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Company</h3>
              <ul className="space-y-3 text-lg">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Legal</h3>
              <ul className="space-y-3 text-lg">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-16 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-lg text-muted-foreground mb-6 md:mb-0">
              &copy; 2025 Resume MCP. All rights reserved.
            </p>
            <div className="flex space-x-8">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
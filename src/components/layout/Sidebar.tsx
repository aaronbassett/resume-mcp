import type { FC } from 'react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Blocks, 
  BarChart3, 
  Plus,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SparklesText } from '../ui/SparklesText';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, badge: '12' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Resumes', href: '/resumes', icon: FileText },
      { label: 'Block Library', href: '/blocks', icon: Blocks },
    ],
  },
];

export const Sidebar: FC = () => {
  const location = useLocation();
  const [isNewResumeHovered, setIsNewResumeHovered] = useState(false);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-sidebar lg:border-r">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <NavLink to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="gradient-primary rounded-lg p-2">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Resume MCP</h1>
              <p className="text-xs text-sidebar-foreground">AI-Powered Profiles</p>
            </div>
          </NavLink>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <NavLink to="/resumes/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setIsNewResumeHovered(true)}
              onMouseLeave={() => setIsNewResumeHovered(false)}
              className="w-full rounded-lg p-3 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all animate-fluid-accent relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-100 animate-fluid-bg" />
              <div className="relative z-10 flex items-center justify-center space-x-2">
                <Plus className="h-4 w-4" />
                <SparklesText enabled={isNewResumeHovered} sparkleColor="#ffffff">
                  <span>New Resume</span>
                </SparklesText>
              </div>
            </motion.button>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 px-4 py-2">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  
                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-sidebar-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Upgrade Card */}
        <div className="p-4">
          <div className="gradient-secondary rounded-lg p-4 text-center">
            <Star className="mx-auto mb-2 h-6 w-6 text-white" />
            <h4 className="font-semibold text-white mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-white/80 mb-3">Unlock unlimited resumes and advanced analytics</p>
            <button className="w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Export navigation sections for use in mobile drawer
export { navSections };
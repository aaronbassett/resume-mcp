import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  X, 
  Zap, 
  Plus, 
  Star, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Settings, 
  User, 
  LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { navSections } from './Sidebar';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileDrawer: FC<MobileDrawerProps> = ({ open, onOpenChange }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onOpenChange(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    onOpenChange(false);
  };

  const handleNavClick = () => {
    onOpenChange(false);
  };

  const handleCommandPalette = () => {
    setCommandOpen(true);
    onOpenChange(false);
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => onOpenChange(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full bg-background border-l lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <Link to="/dashboard" className="flex items-center space-x-3" onClick={handleNavClick}>
                    <div className="gradient-primary rounded-lg p-2">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">Resume MCP</h1>
                      <p className="text-xs text-muted-foreground">AI-Powered Profiles</p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-9 w-9 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Profile Section */}
                <div className="border-b p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.fullName}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCommandPalette}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Search className="h-4 w-4 mb-1" />
                      <span className="text-xs">Search</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="h-4 w-4 mb-1" />
                          <span className="text-xs">Dark</span>
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4 mb-1" />
                          <span className="text-xs">Light</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center p-3 h-auto relative"
                    >
                      <Bell className="h-4 w-4 mb-1" />
                      <span className="text-xs">Alerts</span>
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSettings}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Settings className="h-4 w-4 mb-1" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </div>
                </div>

                {/* New Resume Button */}
                <div className="p-4 border-b">
                  <NavLink to="/resumes/new" onClick={handleNavClick}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="gradient-primary w-full rounded-lg p-4 text-primary-foreground font-medium shadow-lg"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>New Resume</span>
                      </div>
                    </motion.button>
                  </NavLink>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-6">
                    {navSections.map((section) => (
                      <div key={section.title}>
                        <h3 className="mb-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <NavLink
                                to={item.href}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                  `group flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                                    isActive
                                      ? 'bg-accent text-accent-foreground'
                                      : 'text-foreground'
                                  }`
                                }
                              >
                                <div className="flex items-center space-x-3">
                                  <item.icon className="h-5 w-5" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                    {item.badge}
                                  </span>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </nav>

                {/* Bottom Actions */}
                <div className="border-t p-4 space-y-3">
                  {/* Upgrade Card */}
                  <div className="gradient-secondary rounded-lg p-4 text-center">
                    <Star className="mx-auto mb-2 h-6 w-6 text-white" />
                    <h4 className="font-semibold text-white mb-1">Upgrade to Pro</h4>
                    <p className="text-xs text-white/80 mb-3">Unlock unlimited resumes</p>
                    <button className="w-full rounded-md bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors">
                      Upgrade Now
                    </button>
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-2">
                    <Link to={`/u/${user?.username}`} onClick={handleNavClick}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-3 h-4 w-4" />
                        Public Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      {commandOpen && (
        <div className="lg:hidden">
          {/* Command palette component would go here */}
        </div>
      )}
    </>
  );
};
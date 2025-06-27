import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  FileText, 
  Blocks, 
  BarChart3, 
  Settings, 
  Plus, 
  Moon, 
  Sun, 
  User, 
  LogOut,
  Home,
  Edit,
  Copy,
  Trash2,
  Eye,
  Download,
  Share,
  Palette,
  Monitor,
  Smartphone,
  Laptop
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  const page = pages[pages.length - 1];

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
      setPages([]);
    }
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  // Focus management and prevent body scroll
  useEffect(() => {
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the command input after a brief delay to ensure it's rendered
      const timer = setTimeout(() => {
        const input = commandRef.current?.querySelector('input');
        if (input) {
          input.focus();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  if (!open) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
        <Command
          ref={commandRef}
          className="mx-auto overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
          onKeyDown={(e) => {
            // Escape goes to previous page or closes
            if (e.key === 'Escape') {
              e.preventDefault();
              if (pages.length > 0) {
                setPages((pages) => pages.slice(0, -1));
              } else {
                onOpenChange(false);
              }
            }
            // Backspace goes to previous page when search is empty
            if (e.key === 'Backspace' && !search && pages.length > 0) {
              e.preventDefault();
              setPages((pages) => pages.slice(0, -1));
            }
          }}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"
            />
            <div className="ml-auto flex items-center space-x-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {!page && (
              <>
                {/* Navigation */}
                <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/dashboard'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/resumes'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Resumes</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/blocks'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Blocks className="h-4 w-4" />
                    <span>Manage Blocks</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/analytics'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>View Analytics</span>
                  </Command.Item>
                </Command.Group>

                {/* Create Actions */}
                <Command.Group heading="Create" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide mt-4">
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/resumes/new'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Resume</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => setPages([...pages, 'blocks'])}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Block...</span>
                  </Command.Item>
                </Command.Group>

                {/* Settings */}
                <Command.Group heading="Settings" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide mt-4">
                  <Command.Item
                    onSelect={() => setPages([...pages, 'theme'])}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Palette className="h-4 w-4" />
                    <span>Change Theme...</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/settings'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Command.Item>
                </Command.Group>

                {/* Account */}
                <Command.Group heading="Account" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide mt-4">
                  <Command.Item
                    onSelect={() => runCommand(() => console.log('View profile'))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                  >
                    <User className="h-4 w-4" />
                    <span>View Profile</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      logout();
                      navigate('/');
                    })}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer text-destructive mb-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {/* Theme Selection Page */}
            {page === 'theme' && (
              <Command.Group heading="Theme" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
                <Command.Item
                  onSelect={() => runCommand(() => {
                    if (theme !== 'light') toggleTheme();
                    console.log('Switched to light theme');
                  })}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Sun className="h-4 w-4" />
                  <span>Light Theme</span>
                  {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => {
                    if (theme !== 'dark') toggleTheme();
                    console.log('Switched to dark theme');
                  })}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark Theme</span>
                  {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('System theme selected'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Monitor className="h-4 w-4" />
                  <span>System Theme</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Block Creation Page */}
            {page === 'blocks' && (
              <Command.Group heading="Create Block" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Creating experience block'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Blocks className="h-4 w-4" />
                  <span>Experience Block</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Creating education block'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Blocks className="h-4 w-4" />
                  <span>Education Block</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Creating skills block'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Blocks className="h-4 w-4" />
                  <span>Skills Block</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Creating project block'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Blocks className="h-4 w-4" />
                  <span>Project Block</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Search-based sub-items */}
            {search && (
              <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide mt-4">
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Copy resume link'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Resume Link</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Download resume as PDF'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download as PDF</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => console.log('Share resume'))}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer mb-1"
                >
                  <Share className="h-4 w-4" />
                  <span>Share Resume</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
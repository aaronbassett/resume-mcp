import type { FC } from 'react';
import { useState } from 'react';
import { Bell, Search, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { CommandPalette } from '../ui/CommandPalette';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';

export const Header: FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b h-16">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCommandOpen(true)}
              className="relative w-80 justify-between text-sm text-muted-foreground h-9"
            >
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                <span>Search or run a command...</span>
              </div>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-xs"></span>
            </Button>

            {/* User Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center space-x-3 hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors cursor-pointer">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.fullName}
                    size="md"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  </div>
                </div>
              }
            >
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              
              <DropdownItem onClick={handleSettings}>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </div>
              </DropdownItem>
              
              <Link to={`/u/${user?.username}`}>
                <DropdownItem>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Public Profile</span>
                  </div>
                </DropdownItem>
              </Link>
              
              <DropdownSeparator />
              
              <DropdownItem onClick={handleLogout}>
                <div className="flex items-center space-x-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </div>
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
};
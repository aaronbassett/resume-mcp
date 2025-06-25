import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageFooter } from './PageFooter';
import { useAuthStore } from '../../store/auth';

export const AppShell: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        <PageFooter />
      </div>
    </div>
  );
};
import type { FC } from 'react';

export const ResumeFooter: FC = () => {
  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <p>&copy; 2025 Resume MCP. All rights reserved. Powered by AI-driven professional profiles.</p>
        </div>
      </div>
    </footer>
  );
};
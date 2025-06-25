import type { FC } from 'react';

export const PageFooter: FC = () => {
  return (
    <footer className="border-t bg-card mt-16">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <p>&copy; 2025 Resume MCP. All rights reserved.</p>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <div className="flex items-center space-x-4">
            <span>Made with ❤️ for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
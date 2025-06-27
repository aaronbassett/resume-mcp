import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Download, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import type { DownloadFormat } from '../../types/resume';

interface ResumeHeaderProps {
  username: string;
  resumeSlug: string;
}

export const ResumeHeader: FC<ResumeHeaderProps> = ({ username, resumeSlug }) => {
  const [preferredFormat, setPreferredFormat] = useState<DownloadFormat>('PDF');

  useEffect(() => {
    const saved = localStorage.getItem('preferredDownloadFormat') as DownloadFormat;
    if (saved && ['PDF', 'DOCX', 'JSON'].includes(saved)) {
      setPreferredFormat(saved);
    }
  }, []);

  const handleFormatSelect = (format: DownloadFormat) => {
    setPreferredFormat(format);
    localStorage.setItem('preferredDownloadFormat', format);
    downloadResume(format);
  };

  const downloadResume = (format: DownloadFormat) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const extension = format.toLowerCase();
    const filename = `${username}-${resumeSlug}-${currentDate}.${extension}`;
    
    // In a real implementation, this would make an API call to generate and download the file
    console.log(`Downloading resume as ${format}: ${filename}`);
    
    // Mock download - in production this would be a proper file download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Mock ${format} content for ${filename}`));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="gradient-primary rounded-lg p-2">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Resume MCP</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Profiles</p>
            </div>
          </Link>
          
          {/* Download Controls */}
          <div className="flex items-center">
            <div className="flex rounded-lg border border-input bg-background">
              <Button
                variant="ghost"
                onClick={() => downloadResume(preferredFormat)}
                className="rounded-r-none border-r border-input"
              >
                <Download className="mr-2 h-4 w-4" />
                Download as {preferredFormat}
              </Button>
              
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    className="rounded-l-none px-3"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                }
                align="right"
              >
                <DropdownItem onClick={() => handleFormatSelect('PDF')}>
                  <div className="flex items-center justify-between w-full">
                    <span>PDF</span>
                    {preferredFormat === 'PDF' && <span className="text-primary">✓</span>}
                  </div>
                </DropdownItem>
                <DropdownItem onClick={() => handleFormatSelect('DOCX')}>
                  <div className="flex items-center justify-between w-full">
                    <span>DOCX</span>
                    {preferredFormat === 'DOCX' && <span className="text-primary">✓</span>}
                  </div>
                </DropdownItem>
                <DropdownItem onClick={() => handleFormatSelect('JSON')}>
                  <div className="flex items-center justify-between w-full">
                    <span>JSON</span>
                    {preferredFormat === 'JSON' && <span className="text-primary">✓</span>}
                  </div>
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
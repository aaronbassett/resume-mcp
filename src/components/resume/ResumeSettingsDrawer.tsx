import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Globe, Eye, Shield, FileText, Wand2, Code, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextInput, Select, Textarea } from 'flowbite-react';
import { ToggleSwitch } from '../analytics/ToggleSwitch';

interface ResumeSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ResumeSettings) => void;
  initialSettings?: Partial<ResumeSettings>;
}

export interface ResumeSettings {
  // Resume Page Settings
  publishResumePage: boolean;
  presenceBadge: 'none' | 'count-only' | 'show-profile';
  enableResumeDownloads: boolean;
  resumePageTemplate: 'standard' | 'traditional' | 'neo-brutalist' | 'namaste' | 'zine' | 'enterprise';
  allowUsersSwitchTemplate: boolean;
  visibility: 'public' | 'authenticated';
  
  // Mischief & LLMs
  enableMischiefMode: boolean;
  includeCustomMischief: boolean;
  customMischiefInstructions: string;
  attemptAvoidDetection: boolean;
  embedLLMInstructions: boolean;
  
  // Metadata
  urlSlug: string;
  metaTitle: string;
  metaDescription: string;
  robotsDirectives: string[];
}

const defaultSettings: ResumeSettings = {
  publishResumePage: true,
  presenceBadge: 'none',
  enableResumeDownloads: true,
  resumePageTemplate: 'standard',
  allowUsersSwitchTemplate: false,
  visibility: 'public',
  
  enableMischiefMode: true,
  includeCustomMischief: false,
  customMischiefInstructions: '',
  attemptAvoidDetection: true,
  embedLLMInstructions: true,
  
  urlSlug: '',
  metaTitle: '',
  metaDescription: '',
  robotsDirectives: ['index', 'follow']
};

const robotsDirectiveOptions = [
  { value: 'index', label: 'index - Allow indexing (default)' },
  { value: 'noindex', label: 'noindex - Prevent indexing' },
  { value: 'follow', label: 'follow - Follow links on the page (default)' },
  { value: 'nofollow', label: 'nofollow - Don\'t follow any links on the page' },
  { value: 'noarchive', label: 'noarchive - Prevent showing cached versions' },
  { value: 'nosnippet', label: 'nosnippet - Prevent showing a text snippet or preview' },
  { value: 'max-snippet:[N]', label: 'max-snippet:[N] - Limit snippet to N characters' },
  { value: 'notranslate', label: 'notranslate - Don\'t offer translation for this page' }
];

export const ResumeSettingsDrawer: FC<ResumeSettingsDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<ResumeSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = <K extends keyof ResumeSettings>(key: K, value: ResumeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleRobotsDirective = (directive: string) => {
    const currentDirectives = [...settings.robotsDirectives];
    
    if (currentDirectives.includes(directive)) {
      // Remove directive
      updateSetting('robotsDirectives', currentDirectives.filter(d => d !== directive));
    } else {
      // Add directive
      updateSetting('robotsDirectives', [...currentDirectives, directive]);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="border-t bg-muted/30 dark:bg-muted/10 shadow-inner">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Advanced Resume Settings
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* Resume Page Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-base flex items-center">
                <Globe className="h-4 w-4 mr-2 text-primary" />
                Resume Page Settings
              </h4>
              
              <div className="space-y-4 pl-6">
                <ToggleSwitch
                  checked={settings.publishResumePage}
                  onChange={(checked) => updateSetting('publishResumePage', checked)}
                  label="Publish Resume Page"
                  description="Make this resume available as a public web page"
                />
                
                <div className={settings.publishResumePage ? '' : 'opacity-50 pointer-events-none'}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Presence Badge</label>
                    <Select
                      value={settings.presenceBadge}
                      onChange={(e) => updateSetting('presenceBadge', e.target.value as any)}
                      disabled={!settings.publishResumePage}
                    >
                      <option value="none">None</option>
                      <option value="count-only">Count Only</option>
                      <option value="show-profile">Show Profile Information</option>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Show a badge indicating your online presence status
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <ToggleSwitch
                      checked={settings.enableResumeDownloads}
                      onChange={(checked) => updateSetting('enableResumeDownloads', checked)}
                      label="Enable Resume Downloads"
                      description="Allow visitors to download your resume in various formats"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Resume Page Template</label>
                    <Select
                      value={settings.resumePageTemplate}
                      onChange={(e) => updateSetting('resumePageTemplate', e.target.value as any)}
                      disabled={!settings.publishResumePage}
                    >
                      <option value="standard">Standard</option>
                      <option value="traditional">Traditional</option>
                      <option value="neo-brutalist">Neo Brutalist</option>
                      <option value="namaste">Namaste</option>
                      <option value="zine">Zine</option>
                      <option value="enterprise">Enterprise</option>
                    </Select>
                  </div>
                  
                  <div className="mt-4">
                    <ToggleSwitch
                      checked={settings.allowUsersSwitchTemplate}
                      onChange={(checked) => updateSetting('allowUsersSwitchTemplate', checked)}
                      label="Allow Users to Switch Template"
                      description="Let visitors change the resume template when viewing"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Visibility</label>
                    <Select
                      value={settings.visibility}
                      onChange={(e) => updateSetting('visibility', e.target.value as any)}
                      disabled={!settings.publishResumePage}
                    >
                      <option value="public">Public</option>
                      <option value="authenticated">Authenticated Users Only</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mischief & LLMs */}
            <div className="space-y-4">
              <h4 className="font-medium text-base flex items-center">
                <Wand2 className="h-4 w-4 mr-2 text-primary" />
                Mischief & LLMs
              </h4>
              
              <div className="space-y-4 pl-6">
                <ToggleSwitch
                  checked={settings.enableMischiefMode}
                  onChange={(checked) => updateSetting('enableMischiefMode', checked)}
                  label="Enable Resume Page Mischief Mode"
                  description="Add fun easter eggs and interactive elements to your resume page"
                />
                
                <ToggleSwitch
                  checked={settings.includeCustomMischief}
                  onChange={(checked) => updateSetting('includeCustomMischief', checked)}
                  label="Include Custom Resume Page Mischief"
                  description="Add your own custom mischief instructions"
                />
                
                {settings.includeCustomMischief && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Resume Page Mischief Instructions</label>
                    <Textarea
                      value={settings.customMischiefInstructions}
                      onChange={(e) => updateSetting('customMischiefInstructions', e.target.value)}
                      placeholder="Enter custom mischief instructions..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe the mischievous behavior you want to add to your resume page
                    </p>
                  </div>
                )}
                
                <ToggleSwitch
                  checked={settings.attemptAvoidDetection}
                  onChange={(checked) => updateSetting('attemptAvoidDetection', checked)}
                  label="Attempt to Avoid Detection"
                  description="Try to make mischief less detectable by LLM detection systems"
                />
                
                <ToggleSwitch
                  checked={settings.embedLLMInstructions}
                  onChange={(checked) => updateSetting('embedLLMInstructions', checked)}
                  label="Embed LLM MCP instructions in resume page"
                  description="Include special instructions for LLMs that view your resume"
                />
              </div>
            </div>
            
            {/* Customize Resume Page Metadata */}
            <div className={`space-y-4 ${settings.publishResumePage ? '' : 'opacity-50 pointer-events-none'}`}>
              <h4 className="font-medium text-base flex items-center">
                <Code className="h-4 w-4 mr-2 text-primary" />
                Customize Resume Page Metadata
              </h4>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Slug</label>
                  <TextInput
                    value={settings.urlSlug}
                    onChange={(e) => updateSetting('urlSlug', e.target.value)}
                    placeholder="custom-resume-url"
                    disabled={!settings.publishResumePage}
                  />
                  <p className="text-xs text-muted-foreground">
                    yourprofile.com/r/{settings.urlSlug || '[auto-generated]'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <TextInput
                    value={settings.metaTitle}
                    onChange={(e) => updateSetting('metaTitle', e.target.value)}
                    placeholder="Your Name | Your Role"
                    disabled={!settings.publishResumePage}
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom title for search engines and social sharing
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={settings.metaDescription}
                    onChange={(e) => updateSetting('metaDescription', e.target.value)}
                    placeholder="Brief description of your professional background and expertise..."
                    rows={3}
                    disabled={!settings.publishResumePage}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description for search engines and social sharing (max 160 characters)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Robots Directives</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {robotsDirectiveOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`robots-${option.value}`}
                          checked={settings.robotsDirectives.includes(option.value)}
                          onChange={() => toggleRobotsDirective(option.value)}
                          className="mr-2"
                          disabled={!settings.publishResumePage}
                        />
                        <label htmlFor={`robots-${option.value}`} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
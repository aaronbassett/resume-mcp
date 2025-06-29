import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Globe, Eye, Wand2, Code, OctagonMinus } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextInput, Select, Textarea } from 'flowbite-react';
import { ToggleSwitch } from '../analytics/ToggleSwitch';
import ReactSelect, { components } from 'react-select';

interface ResumeSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ResumeSettings) => void;
  initialSettings?: Partial<ResumeSettings>;
  resumeId?: string;
}

export interface ResumeSettings {
  // Resume Page Settings
  publishResumePage: boolean;
  presenceBadge: 'none' | 'count-only' | 'show-profile';
  enableResumeDownloads: boolean;
  resumePageTemplate: 'standard' | 'traditional' | 'neo-brutalist' | 'namaste' | 'zine' | 'enterprise';
  allowUsersSwitchTemplate: boolean;
  visibility: 'public' | 'authenticated' | 'unlisted';
  
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
  
  enableMischiefMode: false,
  includeCustomMischief: false,
  customMischiefInstructions: '',
  attemptAvoidDetection: false,
  embedLLMInstructions: true,
  
  urlSlug: '',
  metaTitle: '',
  metaDescription: '',
  robotsDirectives: ['index', 'follow']
};

const robotsDirectiveOptions = [
  { value: 'index', label: 'index - Allow indexing (default)' },
  { value: 'noindex', label: 'noindex - Prevent indexing (page won\'t appear in search results)' },
  { value: 'follow', label: 'follow - Follow links on the page (default)' },
  { value: 'nofollow', label: 'nofollow - Don\'t follow any links on the page' },
  { value: 'noarchive', label: 'noarchive - Prevent showing cached versions in search results' },
  { value: 'nosnippet', label: 'nosnippet - Prevent showing a text snippet or preview in search results' },
  { value: 'notranslate', label: 'notranslate - Don\'t offer translation for this page' }
];

// Custom component to show value instead of label in multi-value pills
const CustomMultiValueLabel = (props: any) => {
  return (
    <components.MultiValueLabel {...props}>
      {props.data.value}
    </components.MultiValueLabel>
  );
};

export const ResumeSettingsDrawer: FC<ResumeSettingsDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings = {},
  resumeId
}) => {
  const [settings, setSettings] = useState<ResumeSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  
  const [showMischiefSettings, setShowMischiefSettings] = useState(false);
  const [showMischiefWarning, setShowMischiefWarning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSettings({
        ...defaultSettings,
        ...initialSettings
      });
      
      // Check if mischief warning has been dismissed for this resume
      if (resumeId) {
        const dismissedMischief = localStorage.getItem(`mischief_dismissed_${resumeId}`);
        if (dismissedMischief === 'true') {
          setShowMischiefWarning(false);
          setShowMischiefSettings(true);
        } else {
          setShowMischiefWarning(true);
          setShowMischiefSettings(false);
        }
      }
    }
  }, [isOpen, initialSettings, resumeId]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = <K extends keyof ResumeSettings>(key: K, value: ResumeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMischiefProceed = () => {
    setShowMischiefWarning(false);
    setShowMischiefSettings(true);
    
    // Store dismissal in localStorage if we have a resumeId
    if (resumeId) {
      localStorage.setItem(`mischief_dismissed_${resumeId}`, 'true');
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <label className="text-sm font-medium">Visibility</label>
                      <Select
                        value={settings.visibility}
                        onChange={(e) => updateSetting('visibility', e.target.value as any)}
                        disabled={!settings.publishResumePage}
                      >
                        <option value="public">Public</option>
                        <option value="authenticated">Authenticated Users Only</option>
                        <option value="unlisted">Unlisted - Requires Direct Link to View</option>
                      </Select>
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
                        Show a badge indicating how many people are currently viewing your resume
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resume Page Metadata */}
              <div className={`space-y-4 ${settings.publishResumePage ? '' : 'opacity-50 pointer-events-none'}`}>
                <h4 className="font-medium text-base flex items-center">
                  <Code className="h-4 w-4 mr-2 text-primary" />
                  Resume Page Metadata
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
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 160) {
                          updateSetting('metaDescription', value);
                        }
                      }}
                      placeholder="Brief description of your professional background and expertise..."
                      rows={3}
                      disabled={!settings.publishResumePage}
                    />
                    <p className="text-xs text-muted-foreground flex justify-between">
                      <span>Brief description for search engines and social sharing</span>
                      <span className={settings.metaDescription.length > 140 ? 'text-amber-500' : ''}>
                        {settings.metaDescription.length}/160
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Robots Directives</label>
                    <ReactSelect
                      isMulti
                      isSearchable
                      isClearable
                      options={robotsDirectiveOptions}
                      value={robotsDirectiveOptions.filter(option => 
                        settings.robotsDirectives.includes(option.value)
                      )}
                      onChange={(selected) => {
                        const values = selected ? selected.map(option => option.value) : [];
                        updateSetting('robotsDirectives', values);
                      }}
                      placeholder="Select a directive"
                      noOptionsMessage={() => "No directives found"}
                      defaultValue={robotsDirectiveOptions.filter(option => 
                        ['index', 'follow'].includes(option.value)
                      )}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isDisabled={!settings.publishResumePage}
                      components={{ MultiValueLabel: CustomMultiValueLabel }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Control how search engines interact with your resume page
                    </p>
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
                <AnimatePresence mode="wait">
                  {showMischiefWarning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <OctagonMinus className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-lg text-destructive/90">
                            <strong>Before You Proceed:</strong> These features manipulate how LLMs interact with your profile data. While hilarious and potentially unethical, hiring managers might not share your sense of humor when they discover their AI assistant has been… enriched. By enabling these features, you accept full responsibility for any resulting chaos.
                          </p>
                          
                          <hr className="my-4 border-destructive/20" />
                          
                          <p className="text-lg text-destructive/90">
                            Could this mischief lead to spontaneous CEO offers with absolutely unhinged comp packages? It's not impossible. But, what is much more likely is rescinded offers, awkward LinkedIn messages, and potential charges. Either way, we're just here to provide the tools; what you do with them is between you, your conscience, and whatever poor LLM stumbles into your web of deception.
                          </p>
                          <div className="py-4 flex justify-center">
                            <Button 
                              variant="destructive" 
                              onClick={handleMischiefProceed}
                            >
                              I understand this is a really bad idea, and I want to proceed anyway.
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {showMischiefSettings && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
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
                        disabled={!settings.enableMischiefMode}
                      />
                      
                      {settings.includeCustomMischief && settings.enableMischiefMode && (
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
                        disabled={!settings.enableMischiefMode}
                      />
                      
                      <ToggleSwitch
                        checked={settings.embedLLMInstructions}
                        onChange={(checked) => updateSetting('embedLLMInstructions', checked)}
                        label="Embed LLM MCP instructions in resume page"
                        description="Include special instructions for LLMs that view your resume"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Key, Info, Globe, Code, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextInput, Select, Textarea } from 'flowbite-react';
import { createApiKey, getApiKeyScopes } from '../../lib/apiKeyService';
import type { CreateApiKeyData, ApiKey, ApiKeyScope } from '../../types/apiKeys';
import type { Resume } from '../../lib/resumeService';

interface ApiKeyFormProps {
  resumes: Resume[];
  onKeyCreated: (key: ApiKey) => void;
}

export const ApiKeyForm: FC<ApiKeyFormProps> = ({ resumes, onKeyCreated }) => {
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    resume_id: resumes.length > 0 ? resumes[0].id : '',
    expires_at: '',
    max_uses: null,
    notes: '',
    rotation_policy: 'never',
    permissions: ['read'],
    rate_limit: 1000
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);
  const [isAdminKey, setIsAdminKey] = useState(false);
  const [availableScopes, setAvailableScopes] = useState<ApiKeyScope[]>([]);
  const [isLoadingScopes, setIsLoadingScopes] = useState(false);

  // Load available scopes
  useEffect(() => {
    const loadScopes = async () => {
      setIsLoadingScopes(true);
      try {
        const result = await getApiKeyScopes();
        if (result.data) {
          setAvailableScopes(result.data);
        }
      } catch (error) {
        console.error('Error loading API key scopes:', error);
      } finally {
        setIsLoadingScopes(false);
      }
    };

    loadScopes();
  }, []);

  // Set default expiration date for admin keys (3 months from now)
  useEffect(() => {
    if (isAdminKey) {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      // Format as YYYY-MM-DDT00:00
      const formattedDate = threeMonthsFromNow.toISOString().split('T')[0] + 'T00:00';
      
      setFormData(prev => ({
        ...prev,
        expires_at: formattedDate,
        resume_id: null, // Admin keys apply to all resumes
        permissions: ['read:all', 'write:all'],
        rate_limit: 10000
      }));
    } else {
      // Reset permissions for non-admin keys
      setFormData(prev => ({
        ...prev,
        permissions: ['read']
      }));
    }
  }, [isAdminKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'max_uses') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? null : parseInt(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => {
      const permissions = [...(prev.permissions || [])];
      
      if (permissions.includes(permission)) {
        return { ...prev, permissions: permissions.filter(p => p !== permission) };
      } else {
        return { ...prev, permissions: [...permissions, permission] };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Key name is required';
    }
    
    if (!isAdminKey && !formData.resume_id) {
      newErrors.resume_id = 'Please select a resume';
    }
    
    if (isAdminKey && !formData.expires_at) {
      newErrors.expires_at = 'Expiration date is required for admin keys';
    }
    
    if (formData.max_uses !== null && (formData.max_uses <= 0 || isNaN(formData.max_uses))) {
      newErrors.max_uses = 'Max uses must be a positive number';
    }

    if (formData.rate_limit <= 0 || isNaN(formData.rate_limit)) {
      newErrors.rate_limit = 'Rate limit must be a positive number';
    }
    
    if (!formData.permissions || formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await createApiKey(formData);
      
      if (result.error) {
        alert(`Failed to create API key: ${result.error}`);
      } else if (result.data) {
        onKeyCreated(result.data);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate max expiry date for admin keys (3 months from now)
  const maxExpiryDate = new Date();
  maxExpiryDate.setMonth(maxExpiryDate.getMonth() + 3);
  const maxExpiryString = maxExpiryDate.toISOString().split('T')[0] + 'T23:59';

  // Group permissions by category
  const basicPermissions = ['read:all', 'write:all'];
  const advancedPermissions = availableScopes
    .filter(scope => !basicPermissions.includes(scope.name))
    .map(scope => scope.name);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key to allow access to your resume data
            </CardDescription>
          </div>
          
          {/* Admin Key Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Admin Key</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                checked={isAdminKey}
                onChange={(e) => setIsAdminKey(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Admin Key Warning */}
        {isAdminKey && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300">
                  Warning: Admin Key
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Admin keys have full write access to your account. They can create, update, and delete your resumes and other API keys. Only create admin keys for trusted applications.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Key Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Key Name</label>
            <TextInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., ChatGPT Integration"
              color={errors.name ? 'failure' : 'gray'}
              helperText={errors.name}
            />
          </div>
          
          {/* Associated Resume */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Associated Resume</label>
            <Select
              name="resume_id"
              value={formData.resume_id || ''}
              onChange={handleChange}
              color={errors.resume_id ? 'failure' : 'gray'}
              helperText={errors.resume_id}
              disabled={isAdminKey}
            >
              {isAdminKey ? (
                <option value="">All Resumes</option>
              ) : resumes.length === 0 ? (
                <option value="">No resumes available</option>
              ) : (
                resumes.map(resume => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))
              )}
            </Select>
            <p className="text-xs text-muted-foreground">
              {isAdminKey 
                ? 'Admin keys have access to all resumes' 
                : 'This key will only provide access to the selected resume'}
            </p>
          </div>
          
          {/* Permissions */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </label>
            <div className={`space-y-4 ${errors.permissions ? 'border border-red-500 rounded-lg p-4' : ''}`}>
              {/* Basic Permissions */}
              <div className="grid grid-cols-2 gap-2">
                {basicPermissions.map(permission => (
                  <div 
                    key={permission}
                    className="flex items-center space-x-2 p-2 rounded border border-input"
                  >
                    <input
                      type="checkbox"
                      id={`perm-${permission}`}
                      checked={formData.permissions?.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      disabled={isAdminKey && ['read:all', 'write:all'].includes(permission)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`perm-${permission}`} className="text-sm">
                      {permission === 'read:all' ? 'Read (All Resources)' : 
                       permission === 'write:all' ? 'Write (All Resources)' : 
                       permission}
                    </label>
                  </div>
                ))}
              </div>
              
              {/* Advanced Permissions Toggle */}
              {advancedPermissions.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showAdvancedPermissions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span>Advanced Permissions</span>
                  </button>
                  
                  {/* Advanced Permissions List */}
                  {showAdvancedPermissions && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {advancedPermissions.map(permission => {
                        const scope = availableScopes.find(s => s.name === permission);
                        return (
                          <div 
                            key={permission}
                            className="flex items-center space-x-2 p-2 rounded border border-input"
                          >
                            <input
                              type="checkbox"
                              id={`perm-${permission}`}
                              checked={formData.permissions?.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              disabled={isAdminKey}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                              <label htmlFor={`perm-${permission}`} className="text-sm">
                                {permission}
                              </label>
                              {scope?.description && (
                                <p className="text-xs text-muted-foreground">{scope.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.permissions && (
              <p className="text-xs text-red-500">{errors.permissions}</p>
            )}
          </div>
          
          {/* Expiration */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{isAdminKey ? 'Expiration Date (Required)' : 'Expiration Date (Optional)'}</span>
            </label>
            <TextInput
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              max={isAdminKey ? maxExpiryString : undefined}
              color={errors.expires_at ? 'failure' : 'gray'}
              helperText={errors.expires_at || (isAdminKey ? 'Admin keys must expire within 3 months' : 'Leave blank for a key that never expires')}
              required={isAdminKey}
            />
          </div>
          
          {/* Max Uses */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Uses (Optional)</label>
            <TextInput
              type="number"
              name="max_uses"
              value={formData.max_uses === null ? '' : formData.max_uses}
              onChange={handleChange}
              min="1"
              color={errors.max_uses ? 'failure' : 'gray'}
              helperText={errors.max_uses}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for unlimited uses
            </p>
          </div>
          
          {/* Advanced Settings Toggle */}
          <div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full justify-between"
            >
              <span>Advanced Settings</span>
              <span>{showAdvancedSettings ? '▲' : '▼'}</span>
            </Button>
          </div>
          
          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <div className="space-y-6 border-t pt-6">
              {/* Rate Limit */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Rate Limit (requests per hour)</span>
                </label>
                <TextInput
                  type="number"
                  name="rate_limit"
                  value={formData.rate_limit}
                  onChange={handleChange}
                  min="1"
                  color={errors.rate_limit ? 'failure' : 'gray'}
                  helperText={errors.rate_limit}
                />
              </div>
              
              {/* Rotation Policy */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Rotation Policy</label>
                <Select
                  name="rotation_policy"
                  value={formData.rotation_policy || 'never'}
                  onChange={handleChange}
                >
                  <option value="never">Never (Manual rotation only)</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often this key should be automatically rotated
                </p>
              </div>
              
              {/* IP Whitelist */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>IP Whitelist (Optional)</span>
                </label>
                <TextInput
                  name="ip_whitelist"
                  value={formData.ip_whitelist?.join(', ') || ''}
                  onChange={(e) => {
                    const ips = e.target.value.split(',').map(ip => ip.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, ip_whitelist: ips.length > 0 ? ips : undefined }));
                  }}
                  placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of IP addresses or CIDR ranges. Leave blank to allow all IPs.
                </p>
              </div>
              
              {/* User Agent Pattern */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>User Agent Pattern (Optional)</span>
                </label>
                <TextInput
                  name="user_agent_pattern"
                  value={formData.user_agent_pattern || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      user_agent_pattern: e.target.value.trim() || undefined 
                    }));
                  }}
                  placeholder="e.g., ^Mozilla.*"
                />
                <p className="text-xs text-muted-foreground">
                  Regular expression to match allowed user agents. Leave blank to allow all.
                </p>
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Add notes about this key's purpose or usage"
              rows={3}
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || resumes.length === 0}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating Key...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate API Key
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
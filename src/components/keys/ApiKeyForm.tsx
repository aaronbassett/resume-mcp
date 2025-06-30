import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Calendar, Key, Info, Globe, Code, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextInput, Select, Textarea } from 'flowbite-react';
import { createApiKey } from '../../lib/apiKeyService';
import type { CreateApiKeyData, ApiKey, ApiKeyScope } from '../../types/apiKeys';
import type { Resume } from '../../lib/resumeService';

interface ApiKeyFormProps {
  resumes: Resume[];
  availablePermissions: ApiKeyScope[];
  onKeyCreated: (key: ApiKey) => void;
}

export const ApiKeyForm: FC<ApiKeyFormProps> = ({ 
  resumes, 
  availablePermissions,
  onKeyCreated 
}) => {
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    resume_id: resumes.length > 0 ? resumes[0].id : '',
    is_admin: false,
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

  // Set default expiration date for admin keys (3 months from now)
  useEffect(() => {
    if (formData.is_admin) {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      // Format as YYYY-MM-DDT00:00
      const formattedDate = threeMonthsFromNow.toISOString().split('T')[0] + 'T00:00';
      
      setFormData(prev => ({
        ...prev,
        expires_at: formattedDate,
        resume_id: null, // Admin keys apply to all resumes
        permissions: ['read', 'write', 'delete', 'admin'],
        rate_limit: 10000
      }));
    } else {
      // Reset permissions for non-admin keys
      setFormData(prev => ({
        ...prev,
        permissions: ['read']
      }));
    }
  }, [formData.is_admin]);

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

  // Handle global permission toggles
  const handleGlobalPermissionChange = (type: 'read' | 'write') => {
    const permissionPrefix = `${type}:`;
    const globalPermission = type === 'read' ? 'read:all' : 'write:all';
    
    setFormData(prev => {
      const currentPermissions = [...(prev.permissions || [])];
      const hasGlobalPermission = currentPermissions.includes(globalPermission);
      
      if (hasGlobalPermission) {
        // Remove global permission
        return {
          ...prev,
          permissions: currentPermissions.filter(p => p !== globalPermission)
        };
      } else {
        // Add global permission and remove specific permissions of same type
        return {
          ...prev,
          permissions: [
            ...currentPermissions.filter(p => !p.startsWith(permissionPrefix) && p !== type),
            globalPermission
          ]
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Key name is required';
    }
    
    if (!formData.is_admin && !formData.resume_id) {
      newErrors.resume_id = 'Please select a resume';
    }
    
    if (formData.is_admin && !formData.expires_at) {
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
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    // Extract category from permission name (e.g., "resume:read" -> "resume")
    const category = permission.name.includes(':') 
      ? permission.name.split(':')[0] 
      : 'general';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, ApiKeyScope[]>);

  // Check if read:all or write:all permissions are selected
  const hasReadAll = formData.permissions?.includes('read:all') || false;
  const hasWriteAll = formData.permissions?.includes('write:all') || false;

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
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Admin Key Warning */}
        {formData.is_admin && (
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
              disabled={formData.is_admin}
            >
              {formData.is_admin ? (
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
              {formData.is_admin 
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
            
            {/* Global Permissions */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center space-x-2 p-2 rounded border ${
                errors.permissions ? 'border-red-500' : 'border-input'
              }`}>
                <input
                  type="checkbox"
                  id="perm-read-all"
                  checked={hasReadAll || formData.is_admin}
                  onChange={() => handleGlobalPermissionChange('read')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={formData.is_admin}
                />
                <label htmlFor="perm-read-all" className={`text-sm ${formData.is_admin ? 'opacity-50' : ''}`}>
                  Read All
                </label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded border border-input">
                <input
                  type="checkbox"
                  id="perm-write-all"
                  checked={hasWriteAll || formData.is_admin}
                  onChange={() => handleGlobalPermissionChange('write')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={formData.is_admin}
                />
                <label htmlFor="perm-write-all" className={`text-sm ${formData.is_admin ? 'opacity-50' : ''}`}>
                  Write All
                </label>
              </div>
            </div>
            
            {/* Advanced Permissions Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
              className="w-full justify-between mt-2"
              disabled={formData.is_admin}
            >
              <span>Advanced Permissions</span>
              {showAdvancedPermissions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {/* Advanced Permissions */}
            {showAdvancedPermissions && (
              <div className="space-y-4 mt-4 border-t pt-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{category} Permissions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <div 
                          key={permission.id} 
                          className={`flex items-center space-x-2 p-2 rounded border ${
                            errors.permissions && !formData.permissions?.length 
                              ? 'border-red-500' 
                              : 'border-input'
                          }`}
                          title={permission.description || ''}
                        >
                          <input
                            type="checkbox"
                            id={`perm-${permission.name}`}
                            checked={formData.permissions?.includes(permission.name) || formData.is_admin}
                            onChange={() => handlePermissionChange(permission.name)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            disabled={formData.is_admin || 
                              (permission.name.startsWith('read:') && hasReadAll) ||
                              (permission.name.startsWith('write:') && hasWriteAll)}
                          />
                          <label 
                            htmlFor={`perm-${permission.name}`} 
                            className={`text-sm ${formData.is_admin ? 'opacity-50' : ''}`}
                          >
                            {permission.name}
                          </label>
                          {permission.description && (
                            <div className="group relative">
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                {permission.description}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.permissions && (
              <p className="text-xs text-red-500">{errors.permissions}</p>
            )}
            
            {formData.is_admin && (
              <p className="text-xs text-muted-foreground mt-2">
                Admin keys automatically have all permissions
              </p>
            )}
          </div>
          
          {/* Expiration */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formData.is_admin ? 'Expiration Date (Required)' : 'Expiration Date (Optional)'}</span>
            </label>
            <TextInput
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              max={formData.is_admin ? maxExpiryString : undefined}
              color={errors.expires_at ? 'failure' : 'gray'}
              helperText={errors.expires_at || (formData.is_admin ? 'Admin keys must expire within 3 months' : 'Leave blank for a key that never expires')}
              required={formData.is_admin}
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
              {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
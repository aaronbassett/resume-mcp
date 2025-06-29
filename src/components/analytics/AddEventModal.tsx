import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { CircleX, Building, Phone, Users, Award, XCircle, Calendar, MapPin, Clock, DollarSign, Star, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { TextInput, Textarea, Select, Tooltip } from 'flowbite-react';
import type { JourneyEvent } from '../../types/analytics';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<JourneyEvent, 'id'>) => void;
  resumeId: string;
  preselectedEventType?: string;
}

type EventType = 'initial_outreach' | 'follow_up_call' | 'interview_round' | 'offer' | 'rejection';

interface FormData {
  type: EventType;
  date: string;
  apiKey: string;
  // Initial Outreach
  companyName: string;
  positionTitle: string;
  notes: string;
  // Follow-up Call
  duration: number;
  callType: 'recruiter_screen' | 'technical_screen' | 'hiring_manager' | 'other';
  outcome: 'moved_forward' | 'rejected' | 'ghosted' | 'pending';
  // Interview Round
  location: 'phone' | 'video' | 'onsite' | 'hybrid';
  interviewerCount: number;
  interviewType: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'cultural_fit' | 'other';
  difficultyRating: number;
  feedbackReceived: string;
  // Offer
  baseSalary: number;
  signingBonus: number;
  equityType: 'rsu' | 'options' | 'none';
  equityAmount: number;
  vestingSchedule: string;
  otherPerksValue: number;
  negotiationNotes: string;
  initialOffer: number;
  finalOffer: number;
  status: 'accepted' | 'declined' | 'pending';
  declineReason: string;
  // Rejection
  stage: 'initial_screening' | 'phone_screen' | 'technical_interview' | 'onsite' | 'final_round' | 'offer_stage';
  reasonGiven: string;
  realReason: string;
}

const eventTypeOptions = [
  { 
    value: 'initial_outreach', 
    label: 'Application', 
    icon: Building, 
    bgColor: 'bg-blue-500',
    glowColor: '#3b82f6'
  },
  { 
    value: 'follow_up_call', 
    label: 'Call', 
    icon: Phone, 
    bgColor: 'bg-purple-500',
    glowColor: '#8b5cf6'
  },
  { 
    value: 'interview_round', 
    label: 'Interview', 
    icon: Users, 
    bgColor: 'bg-orange-500',
    glowColor: '#f97316'
  },
  { 
    value: 'offer', 
    label: 'Offer', 
    icon: Award, 
    bgColor: 'bg-green-500',
    glowColor: '#10b981'
  },
  { 
    value: 'rejection', 
    label: 'Rejection', 
    icon: XCircle, 
    bgColor: 'bg-red-500',
    glowColor: '#ef4444'
  },
];

// Mock API keys - in a real app, these would come from the backend
const mockApiKeys = [
  { value: 'mcp_key_fullstack_001', label: 'Full Stack Developer API Key' },
  { value: 'mcp_key_frontend_002', label: 'Frontend Specialist API Key' },
  { value: 'mcp_key_react_003', label: 'Senior React Engineer API Key' },
  { value: 'mcp_key_devops_004', label: 'DevOps Engineer API Key' },
];

export const AddEventModal: FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  resumeId,
  preselectedEventType
}) => {
  const [formData, setFormData] = useState<FormData>({
    type: (preselectedEventType as EventType) || 'initial_outreach',
    date: new Date().toISOString().split('T')[0],
    apiKey: mockApiKeys[0]?.value || '',
    companyName: '',
    positionTitle: '',
    notes: '',
    duration: 30,
    callType: 'recruiter_screen',
    outcome: 'pending',
    location: 'video',
    interviewerCount: 1,
    interviewType: 'technical',
    difficultyRating: 5,
    feedbackReceived: '',
    baseSalary: 0,
    signingBonus: 0,
    equityType: 'none',
    equityAmount: 0,
    vestingSchedule: '4 years, 25% per year',
    otherPerksValue: 0,
    negotiationNotes: '',
    initialOffer: 0,
    finalOffer: 0,
    status: 'pending',
    declineReason: '',
    stage: 'initial_screening',
    reasonGiven: '',
    realReason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const selectedEventType = eventTypeOptions.find(option => option.value === formData.type);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.apiKey) {
      newErrors.apiKey = 'API key is required';
    }

    if (formData.type === 'initial_outreach') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.positionTitle.trim()) {
        newErrors.positionTitle = 'Position title is required';
      }
    }

    if (formData.type === 'follow_up_call') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (formData.duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }
    }

    if (formData.type === 'interview_round') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (formData.interviewerCount <= 0) {
        newErrors.interviewerCount = 'Number of interviewers must be greater than 0';
      }
      if (formData.difficultyRating < 1 || formData.difficultyRating > 10) {
        newErrors.difficultyRating = 'Difficulty rating must be between 1 and 10';
      }
    }

    if (formData.type === 'offer') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (formData.baseSalary <= 0) {
        newErrors.baseSalary = 'Base salary must be greater than 0';
      }
    }

    if (formData.type === 'rejection') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const baseEvent = {
      resumeId,
      date: new Date(formData.date),
    };

    let event: Omit<JourneyEvent, 'id'>;

    switch (formData.type) {
      case 'initial_outreach':
        event = {
          ...baseEvent,
          type: 'initial_outreach',
          companyName: formData.companyName,
          positionTitle: formData.positionTitle,
          notes: formData.notes || undefined,
        };
        break;

      case 'follow_up_call':
        event = {
          ...baseEvent,
          type: 'follow_up_call',
          duration: formData.duration,
          callType: formData.callType,
          outcome: formData.outcome,
          notes: formData.notes || undefined,
        };
        break;

      case 'interview_round':
        event = {
          ...baseEvent,
          type: 'interview_round',
          location: formData.location,
          interviewerCount: formData.interviewerCount,
          interviewType: formData.interviewType,
          difficultyRating: formData.difficultyRating,
          outcome: formData.outcome,
          feedbackReceived: formData.feedbackReceived || undefined,
          notes: formData.notes || undefined,
        };
        break;

      case 'offer':
        const totalComp = formData.baseSalary + formData.signingBonus + formData.otherPerksValue;
        event = {
          ...baseEvent,
          type: 'offer',
          baseSalary: formData.baseSalary,
          signingBonus: formData.signingBonus > 0 ? formData.signingBonus : undefined,
          equity: formData.equityType !== 'none' ? {
            type: formData.equityType,
            amount: formData.equityAmount,
            vestingSchedule: formData.vestingSchedule,
          } : undefined,
          otherPerksValue: formData.otherPerksValue > 0 ? formData.otherPerksValue : undefined,
          totalCompCalculation: totalComp,
          negotiationNotes: formData.negotiationNotes || undefined,
          initialOffer: formData.initialOffer > 0 ? formData.initialOffer : undefined,
          finalOffer: formData.finalOffer > 0 ? formData.finalOffer : formData.baseSalary,
          status: formData.status,
          declineReason: formData.status === 'declined' ? formData.declineReason : undefined,
        };
        break;

      case 'rejection':
        event = {
          ...baseEvent,
          type: 'rejection',
          stage: formData.stage,
          reasonGiven: formData.reasonGiven || undefined,
          realReason: formData.realReason || undefined,
          notes: formData.notes || undefined,
        };
        break;

      default:
        return;
    }

    onSave(event);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      type: 'initial_outreach',
      date: new Date().toISOString().split('T')[0],
      apiKey: mockApiKeys[0]?.value || '',
      companyName: '',
      positionTitle: '',
      notes: '',
      duration: 30,
      callType: 'recruiter_screen',
      outcome: 'pending',
      location: 'video',
      interviewerCount: 1,
      interviewType: 'technical',
      difficultyRating: 5,
      feedbackReceived: '',
      baseSalary: 0,
      signingBonus: 0,
      equityType: 'none',
      equityAmount: 0,
      vestingSchedule: '4 years, 25% per year',
      otherPerksValue: 0,
      negotiationNotes: '',
      initialOffer: 0,
      finalOffer: 0,
      status: 'pending',
      declineReason: '',
      stage: 'initial_screening',
      reasonGiven: '',
      realReason: ''
    });
    setErrors({});
    onClose();
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border rounded-xl shadow-2xl"
        >
          <Card>
            <CardHeader className="relative pb-4">
              {/* Close button in top right */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose} 
                className="absolute top-4 right-4 h-12 w-12 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <CircleX className="h-8 w-8" />
              </Button>
              
              {/* Header content aligned left with icon */}
              <div className="flex items-center space-x-3 pr-16">
                {selectedEventType && (
                  <div 
                    className={`p-2 rounded-lg ${selectedEventType.bgColor} text-white`}
                    style={{
                      filter: `drop-shadow(0 0 8px ${selectedEventType.glowColor}40)`
                    }}
                  >
                    <selectedEventType.icon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle>Add New {selectedEventType?.label || 'Event'}</CardTitle>
                  <CardDescription>Log a new event in your job search journey</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Event Type Selection - Horizontal row of icons with different colors */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {eventTypeOptions.map((option) => (
                    <Tooltip key={option.value} content={option.label}>
                      <button
                        onClick={() => updateField('type', option.value)}
                        className={`p-3 rounded-lg transition-all ${
                          formData.type === option.value
                            ? `${option.bgColor} text-white`
                            : 'hover:bg-accent text-muted-foreground hover:text-accent-foreground'
                        }`}
                        style={formData.type === option.value ? {
                          filter: `drop-shadow(0 0 8px ${option.glowColor}40)`
                        } : {}}
                      >
                        <option.icon className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Date and API Key */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                  </label>
                  <TextInput
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    color={errors.date ? 'failure' : 'gray'}
                    helperText={errors.date}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>API Key</span>
                  </label>
                  <Select
                    value={formData.apiKey}
                    onChange={(e) => updateField('apiKey', e.target.value)}
                    color={errors.apiKey ? 'failure' : 'gray'}
                    helperText={errors.apiKey}
                  >
                    {mockApiKeys.map((apiKey) => (
                      <option key={apiKey.value} value={apiKey.value}>
                        {apiKey.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Company Name (for all types) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Company Name</span>
                </label>
                <TextInput
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Enter company name"
                  color={errors.companyName ? 'failure' : 'gray'}
                  helperText={errors.companyName}
                />
              </div>

              {/* Type-specific fields */}
              {formData.type === 'initial_outreach' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position Title</label>
                    <TextInput
                      value={formData.positionTitle}
                      onChange={(e) => updateField('positionTitle', e.target.value)}
                      placeholder="Enter position title"
                      color={errors.positionTitle ? 'failure' : 'gray'}
                      helperText={errors.positionTitle}
                    />
                  </div>
                </>
              )}

              {formData.type === 'follow_up_call' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Duration (minutes)</span>
                      </label>
                      <TextInput
                        type="number"
                        value={formData.duration}
                        onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                        min="1"
                        color={errors.duration ? 'failure' : 'gray'}
                        helperText={errors.duration}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Call Type</label>
                      <Select
                        value={formData.callType}
                        onChange={(e) => updateField('callType', e.target.value)}
                      >
                        <option value="recruiter_screen">Recruiter Screen</option>
                        <option value="technical_screen">Technical Screen</option>
                        <option value="hiring_manager">Hiring Manager</option>
                        <option value="other">Other</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Outcome</label>
                    <Select
                      value={formData.outcome}
                      onChange={(e) => updateField('outcome', e.target.value)}
                    >
                      <option value="moved_forward">Moved Forward</option>
                      <option value="rejected">Rejected</option>
                      <option value="ghosted">Ghosted</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </div>
                </>
              )}

              {formData.type === 'interview_round' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </label>
                      <Select
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                      >
                        <option value="phone">Phone</option>
                        <option value="video">Video</option>
                        <option value="onsite">On-site</option>
                        <option value="hybrid">Hybrid</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Number of Interviewers</span>
                      </label>
                      <TextInput
                        type="number"
                        value={formData.interviewerCount}
                        onChange={(e) => updateField('interviewerCount', parseInt(e.target.value) || 1)}
                        min="1"
                        color={errors.interviewerCount ? 'failure' : 'gray'}
                        helperText={errors.interviewerCount}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Interview Type</label>
                      <Select
                        value={formData.interviewType}
                        onChange={(e) => updateField('interviewType', e.target.value)}
                      >
                        <option value="technical">Technical</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system_design">System Design</option>
                        <option value="coding">Coding</option>
                        <option value="cultural_fit">Cultural Fit</option>
                        <option value="other">Other</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Difficulty (1-10)</span>
                      </label>
                      <TextInput
                        type="number"
                        value={formData.difficultyRating}
                        onChange={(e) => updateField('difficultyRating', parseInt(e.target.value) || 5)}
                        min="1"
                        max="10"
                        color={errors.difficultyRating ? 'failure' : 'gray'}
                        helperText={errors.difficultyRating}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Outcome</label>
                    <Select
                      value={formData.outcome}
                      onChange={(e) => updateField('outcome', e.target.value)}
                    >
                      <option value="moved_forward">Moved Forward</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback Received</label>
                    <Textarea
                      value={formData.feedbackReceived}
                      onChange={(e) => updateField('feedbackReceived', e.target.value)}
                      placeholder="Any feedback you received..."
                      rows={2}
                    />
                  </div>
                </>
              )}

              {formData.type === 'offer' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Base Salary</span>
                      </label>
                      <TextInput
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => updateField('baseSalary', parseInt(e.target.value) || 0)}
                        min="0"
                        color={errors.baseSalary ? 'failure' : 'gray'}
                        helperText={errors.baseSalary}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Signing Bonus</label>
                      <TextInput
                        type="number"
                        value={formData.signingBonus}
                        onChange={(e) => updateField('signingBonus', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Equity</label>
                    <div className="grid grid-cols-3 gap-4">
                      <Select
                        value={formData.equityType}
                        onChange={(e) => updateField('equityType', e.target.value)}
                      >
                        <option value="none">No Equity</option>
                        <option value="rsu">RSU</option>
                        <option value="options">Options</option>
                      </Select>
                      {formData.equityType !== 'none' && (
                        <>
                          <TextInput
                            type="number"
                            value={formData.equityAmount}
                            onChange={(e) => updateField('equityAmount', parseInt(e.target.value) || 0)}
                            placeholder="Amount"
                            min="0"
                          />
                          <TextInput
                            value={formData.vestingSchedule}
                            onChange={(e) => updateField('vestingSchedule', e.target.value)}
                            placeholder="Vesting schedule"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onChange={(e) => updateField('status', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </Select>
                  </div>
                  {formData.status === 'declined' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Decline Reason</label>
                      <Textarea
                        value={formData.declineReason}
                        onChange={(e) => updateField('declineReason', e.target.value)}
                        placeholder="Why did you decline this offer?"
                        rows={2}
                      />
                    </div>
                  )}
                </>
              )}

              {formData.type === 'rejection' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stage</label>
                    <Select
                      value={formData.stage}
                      onChange={(e) => updateField('stage', e.target.value)}
                    >
                      <option value="initial_screening">Initial Screening</option>
                      <option value="phone_screen">Phone Screen</option>
                      <option value="technical_interview">Technical Interview</option>
                      <option value="onsite">On-site</option>
                      <option value="final_round">Final Round</option>
                      <option value="offer_stage">Offer Stage</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason Given</label>
                    <Textarea
                      value={formData.reasonGiven}
                      onChange={(e) => updateField('reasonGiven', e.target.value)}
                      placeholder="What reason did they give for the rejection?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Perspective</label>
                    <Textarea
                      value={formData.realReason}
                      onChange={(e) => updateField('realReason', e.target.value)}
                      placeholder="What do you think was the real reason?"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Notes (for all types) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
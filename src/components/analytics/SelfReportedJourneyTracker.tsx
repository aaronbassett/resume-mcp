import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Calendar, Building, Phone, Users, Award, XCircle, DollarSign, Clock, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddEventModal } from './AddEventModal';
import type { SelfReportedJourney, JourneyEvent, OutcomeMetrics } from '../../types/analytics';

interface SelfReportedJourneyTrackerProps {
  journeys: SelfReportedJourney[];
  selectedResumeId?: string;
  outcomeMetrics: OutcomeMetrics;
}

export const SelfReportedJourneyTracker: FC<SelfReportedJourneyTrackerProps> = ({
  journeys,
  selectedResumeId,
  outcomeMetrics
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  // Filter journeys by selected resume
  const filteredJourneys = selectedResumeId 
    ? journeys.filter(journey => journey.resumeId === selectedResumeId)
    : journeys;

  // Get all events from filtered journeys and sort by date
  const allEvents = filteredJourneys
    .flatMap(journey => journey.events)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'initial_outreach': return Building;
      case 'follow_up_call': return Phone;
      case 'interview_round': return Users;
      case 'offer': return Award;
      case 'rejection': return XCircle;
      default: return Calendar;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'initial_outreach': return 'bg-blue-500';
      case 'follow_up_call': return 'bg-purple-500';
      case 'interview_round': return 'bg-orange-500';
      case 'offer': return 'bg-green-500';
      case 'rejection': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatEventTitle = (event: JourneyEvent) => {
    switch (event.type) {
      case 'initial_outreach':
        return `Applied to ${event.companyName} - ${event.positionTitle}`;
      case 'follow_up_call':
        return `${event.callType.replace('_', ' ')} call (${event.duration}min)`;
      case 'interview_round':
        return `${event.interviewType} interview (${event.location})`;
      case 'offer':
        return `Offer received - $${event.totalCompCalculation.toLocaleString()}`;
      case 'rejection':
        return `Rejected at ${event.stage.replace('_', ' ')} stage`;
      default:
        return 'Unknown event';
    }
  };

  const formatEventDetails = (event: JourneyEvent) => {
    switch (event.type) {
      case 'initial_outreach':
        return event.notes || 'Application submitted';
      case 'follow_up_call':
        return `Outcome: ${event.outcome.replace('_', ' ')}${event.notes ? ` • ${event.notes}` : ''}`;
      case 'interview_round':
        return `${event.interviewerCount} interviewer(s) • Difficulty: ${event.difficultyRating}/10 • ${event.outcome.replace('_', ' ')}`;
      case 'offer':
        return `Base: $${event.baseSalary.toLocaleString()}${event.signingBonus ? ` • Signing: $${event.signingBonus.toLocaleString()}` : ''} • Status: ${event.status}`;
      case 'rejection':
        return event.reasonGiven || 'No reason provided';
      default:
        return '';
    }
  };

  // Format date to dd/mm/yyyy
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAddEvent = (eventType?: string) => {
    setSelectedEventType(eventType || '');
    setShowAddModal(true);
  };

  const handleSaveEvent = (event: Omit<JourneyEvent, 'id'>) => {
    // In a real implementation, this would save to the backend
    console.log('Saving event:', event);
    // For now, just close the modal
    setShowAddModal(false);
  };

  const handleEditEvent = (event: JourneyEvent) => {
    // In a real implementation, this would open the edit modal
    console.log('Editing event:', event);
  };

  const handleDeleteEvent = (event: JourneyEvent) => {
    // In a real implementation, this would delete the event
    console.log('Deleting event:', event);
  };

  return (
    <div className="space-y-6">
      {/* Outcome Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outcomeMetrics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Total submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outcomeMetrics.conversionRates.applicationToInterview}%</div>
            <p className="text-xs text-muted-foreground">
              {outcomeMetrics.totalInterviews} interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outcomeMetrics.conversionRates.applicationToOffer}%</div>
            <p className="text-xs text-muted-foreground">
              {outcomeMetrics.totalOffers} offers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Offer</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(outcomeMetrics.averageOfferAmount / 1000)}k</div>
            <p className="text-xs text-muted-foreground">
              Total compensation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
          <CardDescription>Your job search conversion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="font-medium">Applications</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{outcomeMetrics.totalApplications}</div>
                <div className="text-sm text-muted-foreground">100%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="font-medium">Interviews</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{outcomeMetrics.totalInterviews}</div>
                <div className="text-sm text-muted-foreground">{outcomeMetrics.conversionRates.applicationToInterview}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="font-medium">Offers</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{outcomeMetrics.totalOffers}</div>
                <div className="text-sm text-muted-foreground">{outcomeMetrics.conversionRates.applicationToOffer}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="font-medium">Rejections</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{outcomeMetrics.totalRejections}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((outcomeMetrics.totalRejections / outcomeMetrics.totalApplications) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline Insights</span>
            </CardTitle>
            <CardDescription>Average time between key milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Application to Interview</span>
                <span className="text-sm text-muted-foreground">
                  {outcomeMetrics.averageTimeToInterview} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Application to Offer</span>
                <span className="text-sm text-muted-foreground">
                  {outcomeMetrics.averageTimeToOffer} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Interview Difficulty</span>
                <span className="text-sm text-muted-foreground">
                  {outcomeMetrics.averageDifficultyRating}/10
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Log new events in your job search journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleAddEvent('initial_outreach')}
              >
                <Building className="mr-2 h-4 w-4" />
                Log New Application
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleAddEvent('interview_round')}
              >
                <Users className="mr-2 h-4 w-4" />
                Record Interview
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleAddEvent('offer')}
              >
                <Award className="mr-2 h-4 w-4" />
                Log Offer Received
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journey Timeline</CardTitle>
              <CardDescription>
                {selectedResumeId ? 'Events for selected resume' : 'All self-reported events across resumes'}
              </CardDescription>
            </div>
            <Button onClick={() => handleAddEvent()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your job search journey by logging applications, interviews, and outcomes.
              </p>
              <Button onClick={() => handleAddEvent()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allEvents.slice(0, 20).map((event, index) => {
                const IconComponent = getEventIcon(event.type);
                
                return (
                  <div key={`${event.id || index}-${index}`} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors group">
                    <div className={`${getEventColor(event.type)} rounded-full p-2 text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{formatEventTitle(event)}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatEventDetails(event)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEventColor(event.type)} text-white`}>
                          {event.type.replace('_', ' ')}
                        </span>
                        {selectedResumeId === undefined && (
                          <span className="text-xs text-muted-foreground">
                            Resume: {event.resumeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {allEvents.length > 20 && (
                <div className="text-center py-4">
                  <Button variant="outline">
                    Load More Events
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveEvent}
        resumeId={selectedResumeId || 'default'}
        preselectedEventType={selectedEventType}
      />
    </div>
  );
};
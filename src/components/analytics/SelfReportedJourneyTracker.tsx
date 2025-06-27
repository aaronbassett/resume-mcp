import type { FC } from 'react';
import { useState } from 'react';
import { Plus, Calendar, Building, Phone, Users, Award, XCircle, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
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
  const [showAddForm, setShowAddForm] = useState(false);
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
      case 'initial_outreach': return <Building className="h-4 w-4" />;
      case 'follow_up_call': return <Phone className="h-4 w-4" />;
      case 'interview_round': return <Users className="h-4 w-4" />;
      case 'offer': return <Award className="h-4 w-4" />;
      case 'rejection': return <XCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
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
                onClick={() => {
                  setSelectedEventType('initial_outreach');
                  setShowAddForm(true);
                }}
              >
                <Building className="mr-2 h-4 w-4" />
                Log New Application
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setSelectedEventType('interview_round');
                  setShowAddForm(true);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Record Interview
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setSelectedEventType('offer');
                  setShowAddForm(true);
                }}
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
            <Button onClick={() => setShowAddForm(true)}>
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
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allEvents.slice(0, 20).map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className={`${getEventColor(event.type)} rounded-full p-2 text-white`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{formatEventTitle(event)}</h4>
                      <span className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString()}
                      </span>
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
              ))}
              
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

      {/* Add Event Form Modal (placeholder) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
              <CardDescription>Record a new event in your job search journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Event form would go here. In a real implementation, this would include:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Event type selection</li>
                  <li>• Date picker</li>
                  <li>• Company/position fields</li>
                  <li>• Outcome selection</li>
                  <li>• Notes field</li>
                </ul>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowAddForm(false)}>
                    Save Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
import type { FC } from 'react';
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  ExternalLink,
  Award,
  BookOpen,
  Code,
  Languages,
  Heart,
  Users,
  FileText,
  Star,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Figma,
  Gitlab
} from 'lucide-react';
import { Timeline } from 'flowbite-react';
import { Avatar } from '../ui/Avatar';
import type { ResumeData } from '../../types/resume';

interface ResumeContentProps {
  data: ResumeData;
}

export const ResumeContent: FC<ResumeContentProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} - ${end}`;
  };

  const getSocialIcon = (network: string) => {
    const networkLower = network.toLowerCase();
    
    switch (networkLower) {
      case 'github':
        return Github;
      case 'linkedin':
        return Linkedin;
      case 'twitter':
        return Twitter;
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'youtube':
        return Youtube;
      case 'figma':
        return Figma;
      case 'gitlab':
        return Gitlab;
      case 'codepen':
        return Code; // Using Code icon as Lucide doesn't have CodePen
      case 'slack':
        return Users; // Using Users icon as Lucide doesn't have Slack
      case 'twitch':
        return Users; // Using Users icon as Lucide doesn't have Twitch
      default:
        return ExternalLink;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-card shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8">
        <div className="flex items-start space-x-6">
          <Avatar
            src={data.basics.image}
            alt={data.basics.name}
            size="xl"
            className="border-4 border-white/20"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{data.basics.name}</h1>
            <p className="text-xl text-primary-foreground/90 mb-4">{data.basics.label}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${data.basics.email}`} className="hover:underline">
                  {data.basics.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${data.basics.phone}`} className="hover:underline">
                  {data.basics.phone}
                </a>
              </div>
              {data.basics.url && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <a href={data.basics.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {data.basics.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{data.basics.location.city}, {data.basics.location.region}</span>
              </div>
            </div>

            {data.basics.profiles && data.basics.profiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {data.basics.profiles.map((profile, index) => {
                  const IconComponent = getSocialIcon(profile.network);
                  
                  return (
                    <a
                      key={index}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full text-sm hover:bg-white/30 transition-colors"
                      title={`${profile.network}: ${profile.username}`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{profile.network}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12">
        {/* Summary */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Professional Summary</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {data.basics.summary}
          </p>
        </section>

        {/* Work Experience */}
        {data.work && data.work.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <Users className="mr-3 h-6 w-6 text-primary" />
              Work Experience
            </h2>
            <Timeline>
              {data.work.map((job, index) => (
                <Timeline.Item key={index}>
                  <Timeline.Point />
                  <Timeline.Content>
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{job.position}</h3>
                          <p className="text-lg text-primary font-medium">{job.name}</p>
                        </div>
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {formatDateRange(job.startDate, job.endDate)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3 leading-relaxed">{job.summary}</p>
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="space-y-1">
                          {job.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-muted-foreground">
                              <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Timeline.Content>
                </Timeline.Item>
              ))}
            </Timeline>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <BookOpen className="mr-3 h-6 w-6 text-primary" />
              Education
            </h2>
            <div className="space-y-6">
              {data.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-primary pl-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {edu.studyType} in {edu.area}
                      </h3>
                      <p className="text-lg text-primary font-medium">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                  </div>
                  {edu.score && (
                    <p className="text-muted-foreground mb-2">GPA: {edu.score}</p>
                  )}
                  {edu.courses && edu.courses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Relevant Coursework:</p>
                      <p className="text-muted-foreground">{edu.courses.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <Code className="mr-3 h-6 w-6 text-primary" />
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.skills.map((skill, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{skill.name}</h3>
                    <span className="text-sm text-primary font-medium">{skill.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              Projects
            </h2>
            <div className="space-y-6">
              {data.projects.map((project, index) => (
                <div key={index} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center space-x-1"
                        >
                          <span>View Project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatDateRange(project.startDate, project.endDate)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3 leading-relaxed">{project.description}</p>
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="space-y-1">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-muted-foreground">
                          <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <Award className="mr-3 h-6 w-6 text-primary" />
              Awards & Recognition
            </h2>
            <div className="space-y-4">
              {data.awards.map((award, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
                  <Award className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">{award.title}</h3>
                    <p className="text-primary font-medium">{award.awarder}</p>
                    <p className="text-muted-foreground text-sm">{formatDate(award.date)}</p>
                    <p className="text-muted-foreground mt-1">{award.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 text-foreground flex items-center">
                <Languages className="mr-2 h-5 w-5 text-primary" />
                Languages
              </h3>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{lang.language}</span>
                    <span className="text-muted-foreground text-sm">{lang.fluency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 text-foreground flex items-center">
                <Heart className="mr-2 h-5 w-5 text-primary" />
                Interests
              </h3>
              <div className="space-y-3">
                {data.interests.map((interest, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-foreground mb-1">{interest.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {interest.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
import type { FC } from 'react';
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Figma,
  Gitlab,
  Code,
  Users
} from 'lucide-react';
import type { ResumeData } from '../../../types/resume';

interface EnterpriseStyleProps {
  data: ResumeData;
}

export const EnterpriseStyle: FC<EnterpriseStyleProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} — ${end}`;
  };

  const getSocialIcon = (network: string) => {
    const networkLower = network.toLowerCase();
    
    switch (networkLower) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'youtube': return Youtube;
      case 'figma': return Figma;
      case 'gitlab': return Gitlab;
      case 'codepen': return Code;
      case 'slack': return Users;
      case 'twitch': return Users;
      default: return ExternalLink;
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white text-gray-900 grid grid-cols-1 lg:grid-cols-3 gap-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div className="lg:col-span-1 bg-gray-50 p-8 lg:p-12">
        <div className="space-y-8">
          {/* Name */}
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {data.basics.name}
            </h1>
            <p className="text-lg font-light text-gray-600">
              {data.basics.label}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
              Contact
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${data.basics.email}`} className="text-gray-600 hover:text-gray-900">
                  {data.basics.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${data.basics.phone}`} className="text-gray-600 hover:text-gray-900">
                  {data.basics.phone}
                </a>
              </div>
              {data.basics.url && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={data.basics.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    {data.basics.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {data.basics.location.city}, {data.basics.location.region}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {data.basics.profiles && data.basics.profiles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                Links
              </h2>
              <div className="space-y-3">
                {data.basics.profiles.map((profile, index) => {
                  const IconComponent = getSocialIcon(profile.network);
                  
                  return (
                    <a
                      key={index}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900"
                      title={`${profile.network}: ${profile.username}`}
                    >
                      <IconComponent className="h-4 w-4 text-gray-400" />
                      <span>{profile.network}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                Skills
              </h2>
              <div className="space-y-4">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {skill.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {skill.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 p-8 lg:p-12">
        <div className="space-y-12">
          {/* Summary */}
          <section>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-6">
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.basics.summary}
            </p>
          </section>

          {/* Work Experience */}
          {data.work && data.work.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-8">
                Experience
              </h2>
              <div className="space-y-8">
                {data.work.map((job, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {job.position}
                        </h3>
                        <p className="text-base text-gray-600">
                          {job.name}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {formatDateRange(job.startDate, job.endDate)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {job.summary}
                    </p>
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="space-y-2">
                        {job.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start space-x-3 text-gray-700">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
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

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-8">
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {edu.studyType} in {edu.area}
                        </h3>
                        <p className="text-base text-gray-600">
                          {edu.institution}
                        </p>
                        {edu.score && (
                          <p className="text-sm text-gray-500">
                            GPA: {edu.score}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </span>
                    </div>
                    {edu.courses && edu.courses.length > 0 && (
                      <p className="text-gray-700 text-sm mt-2">
                        <span className="font-medium">Relevant Coursework:</span> {edu.courses.join(', ')}
                      </p>
                    )}
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
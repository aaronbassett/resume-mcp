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

interface TraditionalStyleProps {
  data: ResumeData;
}

export const TraditionalStyle: FC<TraditionalStyleProps> = ({ data }) => {
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
    return `${start} - ${end}`;
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
    <div className="max-w-4xl mx-auto bg-white shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="text-center py-8 px-8 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-black mb-2">{data.basics.name}</h1>
        <p className="text-lg text-gray-700 mb-4">{data.basics.label}</p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Mail className="h-3 w-3" />
            <span>{data.basics.email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3" />
            <span>{data.basics.phone}</span>
          </div>
          {data.basics.url && (
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span>{data.basics.url.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{data.basics.location.city}, {data.basics.location.region}</span>
          </div>
        </div>

        {data.basics.profiles && data.basics.profiles.length > 0 && (
          <div className="mt-3 flex justify-center gap-3">
            {data.basics.profiles.map((profile, index) => {
              const IconComponent = getSocialIcon(profile.network);
              
              return (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-gray-600 hover:text-black"
                  title={`${profile.network}: ${profile.username}`}
                >
                  <IconComponent className="h-3 w-3" />
                  <span>{profile.network}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Summary */}
        <section>
          <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            {data.basics.summary}
          </p>
        </section>

        {/* Work Experience */}
        {data.work && data.work.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4">
              {data.work.map((job, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-black">{job.position}</h3>
                      <p className="text-gray-700 font-medium">{job.name}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDateRange(job.startDate, job.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 leading-relaxed">{job.summary}</p>
                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                      {job.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
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
            <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
              EDUCATION
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-black">
                        {edu.studyType} in {edu.area}
                      </h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      {edu.score && (
                        <p className="text-gray-600 text-sm">GPA: {edu.score}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                  </div>
                  {edu.courses && edu.courses.length > 0 && (
                    <p className="text-gray-700 text-sm mt-1">
                      <span className="font-medium">Relevant Coursework:</span> {edu.courses.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
              TECHNICAL SKILLS
            </h2>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index}>
                  <span className="font-bold text-black">{skill.name}:</span>{' '}
                  <span className="text-gray-700 text-sm">{skill.keywords.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
              NOTABLE PROJECTS
            </h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-black">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 text-sm hover:text-black"
                        >
                          {project.url}
                        </a>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDateRange(project.startDate, project.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 leading-relaxed">{project.description}</p>
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
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
            <h2 className="text-lg font-bold text-black mb-3 pb-1 border-b border-gray-300">
              AWARDS & RECOGNITION
            </h2>
            <div className="space-y-2">
              {data.awards.map((award, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-black">{award.title}</h3>
                      <p className="text-gray-700">{award.awarder}</p>
                      <p className="text-gray-700 text-sm">{award.summary}</p>
                    </div>
                    <span className="text-sm text-gray-600">{formatDate(award.date)}</span>
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
              <h3 className="text-base font-bold text-black mb-2 pb-1 border-b border-gray-300">
                LANGUAGES
              </h3>
              <div className="space-y-1">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium text-black">{lang.language}</span>
                    <span className="text-gray-600 text-sm">{lang.fluency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-black mb-2 pb-1 border-b border-gray-300">
                INTERESTS
              </h3>
              <div className="space-y-1">
                {data.interests.map((interest, index) => (
                  <div key={index}>
                    <span className="font-medium text-black">{interest.name}:</span>{' '}
                    <span className="text-gray-700 text-sm">{interest.keywords.join(', ')}</span>
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
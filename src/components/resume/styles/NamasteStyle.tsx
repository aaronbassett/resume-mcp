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

interface NamasteStyleProps {
  data: ResumeData;
}

export const NamasteStyle: FC<NamasteStyleProps> = ({ data }) => {
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
    <div className="max-w-5xl mx-auto bg-stone-50 text-stone-800">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-100 via-amber-50 to-emerald-100 p-12 text-center">
        <h1 
          className="text-6xl mb-4 text-stone-700"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {data.basics.name}
        </h1>
        <div 
          className="text-2xl text-stone-600 mb-8 font-light tracking-wide"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {data.basics.label}
        </div>
        
        <div 
          className="flex flex-wrap justify-center gap-6 text-stone-600 font-light"
          style={{ fontFamily: 'Inter Condensed, sans-serif' }}
        >
          <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
            <Mail className="h-4 w-4" />
            <span>{data.basics.email}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
            <Phone className="h-4 w-4" />
            <span>{data.basics.phone}</span>
          </div>
          {data.basics.url && (
            <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
              <Globe className="h-4 w-4" />
              <span>{data.basics.url.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4" />
            <span>{data.basics.location.city}, {data.basics.location.region}</span>
          </div>
        </div>

        {data.basics.profiles && data.basics.profiles.length > 0 && (
          <div className="mt-6 flex justify-center gap-4">
            {data.basics.profiles.map((profile, index) => {
              const IconComponent = getSocialIcon(profile.network);
              
              return (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-full text-stone-600 hover:bg-white hover:text-stone-800 transition-all"
                  title={`${profile.network}: ${profile.username}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="font-light">{profile.network}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-12 py-16 space-y-16">
        {/* Summary */}
        <section className="text-center max-w-4xl mx-auto">
          <h2 
            className="text-3xl mb-8 text-stone-700"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            About
          </h2>
          <p 
            className="text-lg leading-relaxed text-stone-600 font-light"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {data.basics.summary}
          </p>
        </section>

        {/* Work Experience */}
        {data.work && data.work.length > 0 && (
          <section>
            <h2 
              className="text-4xl mb-12 text-center text-stone-700"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Experience
            </h2>
            <div className="space-y-12">
              {data.work.map((job, index) => (
                <div key={index} className="bg-white/60 p-8 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                    <div>
                      <h3 
                        className="text-2xl text-stone-700 mb-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {job.position}
                      </h3>
                      <p 
                        className="text-xl text-stone-600 font-light"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {job.name}
                      </p>
                    </div>
                    <span 
                      className="text-stone-500 font-light mt-2 lg:mt-0"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {formatDateRange(job.startDate, job.endDate)}
                    </span>
                  </div>
                  <p 
                    className="text-stone-600 mb-6 leading-relaxed font-light"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {job.summary}
                  </p>
                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="space-y-3">
                      {job.highlights.map((highlight, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start space-x-3 text-stone-600 font-light"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <span className="w-2 h-2 bg-rose-300 rounded-full mt-2 flex-shrink-0"></span>
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
            <h2 
              className="text-4xl mb-12 text-center text-stone-700"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Education
            </h2>
            <div className="space-y-8">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                    <div>
                      <h3 
                        className="text-2xl text-stone-700 mb-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {edu.studyType} in {edu.area}
                      </h3>
                      <p 
                        className="text-xl text-stone-600 font-light"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {edu.institution}
                      </p>
                      {edu.score && (
                        <p 
                          className="text-stone-500 font-light mt-1"
                          style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                        >
                          GPA: {edu.score}
                        </p>
                      )}
                    </div>
                    <span 
                      className="text-stone-500 font-light mt-2 lg:mt-0"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                  </div>
                  {edu.courses && edu.courses.length > 0 && (
                    <div className="mt-4">
                      <p 
                        className="text-stone-600 font-light"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <span className="font-medium">Relevant Coursework:</span> {edu.courses.join(', ')}
                      </p>
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
            <h2 
              className="text-4xl mb-12 text-center text-stone-700"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.skills.map((skill, index) => (
                <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 
                      className="text-xl text-stone-700"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {skill.name}
                    </h3>
                    <span 
                      className="text-stone-500 font-light text-sm"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {skill.level}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-white/80 text-stone-600 px-3 py-1 rounded-full text-sm font-light"
                        style={{ fontFamily: 'Inter, sans-serif' }}
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
            <h2 
              className="text-4xl mb-12 text-center text-stone-700"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Projects
            </h2>
            <div className="space-y-8">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                    <div>
                      <h3 
                        className="text-2xl text-stone-700 mb-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {project.name}
                      </h3>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 hover:text-stone-800 font-light flex items-center space-x-1"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <span>View Project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <span 
                      className="text-stone-500 font-light mt-2 lg:mt-0"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {formatDateRange(project.startDate, project.endDate)}
                    </span>
                  </div>
                  <p 
                    className="text-stone-600 mb-6 leading-relaxed font-light"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {project.description}
                  </p>
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="space-y-3">
                      {project.highlights.map((highlight, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start space-x-3 text-stone-600 font-light"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <span className="w-2 h-2 bg-amber-300 rounded-full mt-2 flex-shrink-0"></span>
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
            <h2 
              className="text-4xl mb-12 text-center text-stone-700"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Recognition
            </h2>
            <div className="space-y-6">
              {data.awards.map((award, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                    <div>
                      <h3 
                        className="text-xl text-stone-700 mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {award.title}
                      </h3>
                      <p 
                        className="text-lg text-stone-600 font-light"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {award.awarder}
                      </p>
                      <p 
                        className="text-stone-600 font-light mt-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {award.summary}
                      </p>
                    </div>
                    <span 
                      className="text-stone-500 font-light mt-2 lg:mt-0"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {formatDate(award.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h3 
                className="text-2xl mb-6 text-stone-700"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Languages
              </h3>
              <div className="space-y-3">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/60 p-4 rounded-xl">
                    <span 
                      className="text-stone-700"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {lang.language}
                    </span>
                    <span 
                      className="text-stone-500 font-light"
                      style={{ fontFamily: 'Inter Condensed, sans-serif' }}
                    >
                      {lang.fluency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <section>
              <h3 
                className="text-2xl mb-6 text-stone-700"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Interests
              </h3>
              <div className="space-y-4">
                {data.interests.map((interest, index) => (
                  <div key={index} className="bg-white/60 p-4 rounded-xl">
                    <h4 
                      className="text-stone-700 mb-2"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {interest.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {interest.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-stone-200 text-stone-600 px-2 py-1 rounded-full text-sm font-light"
                          style={{ fontFamily: 'Inter Condensed, sans-serif' }}
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
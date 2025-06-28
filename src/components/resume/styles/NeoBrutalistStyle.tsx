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

interface NeoBrutalistStyleProps {
  data: ResumeData;
}

export const NeoBrutalistStyle: FC<NeoBrutalistStyleProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'NOW';
    return `${start} → ${end}`;
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

  const colors = [
    'bg-yellow-400',
    'bg-pink-400', 
    'bg-blue-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-red-400',
    'bg-orange-400',
    'bg-cyan-400'
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white relative" style={{ fontFamily: 'Arial Black, sans-serif', zIndex: 1 }}>
      {/* Header */}
      <div className="bg-black text-white p-8 border-8 border-black relative" style={{ zIndex: 1 }}>
        <h1 className="text-6xl font-black uppercase tracking-wider mb-4 transform -skew-x-6 relative" style={{ zIndex: 1 }}>
          {data.basics.name}
        </h1>
        <div className="bg-yellow-400 text-black p-4 border-4 border-black transform skew-x-3 inline-block relative" style={{ zIndex: 1 }}>
          <p className="text-2xl font-black uppercase">{data.basics.label}</p>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 relative" style={{ zIndex: 1 }}>
          <div className="bg-pink-400 p-3 border-4 border-black transform -rotate-1">
            <Mail className="h-6 w-6 mb-2" />
            <p className="font-black text-sm break-all">{data.basics.email}</p>
          </div>
          <div className="bg-blue-400 p-3 border-4 border-black transform rotate-1">
            <Phone className="h-6 w-6 mb-2" />
            <p className="font-black text-sm">{data.basics.phone}</p>
          </div>
          {data.basics.url && (
            <div className="bg-green-400 p-3 border-4 border-black transform -rotate-2">
              <Globe className="h-6 w-6 mb-2" />
              <p className="font-black text-sm break-all">{data.basics.url.replace(/^https?:\/\//, '')}</p>
            </div>
          )}
          <div className="bg-purple-400 p-3 border-4 border-black transform rotate-2">
            <MapPin className="h-6 w-6 mb-2" />
            <p className="font-black text-sm">{data.basics.location.city}, {data.basics.location.region}</p>
          </div>
        </div>

        {data.basics.profiles && data.basics.profiles.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 relative" style={{ zIndex: 1 }}>
            {data.basics.profiles.map((profile, index) => {
              const IconComponent = getSocialIcon(profile.network);
              const colorClass = colors[index % colors.length];
              
              return (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${colorClass} text-black p-3 border-4 border-black font-black text-sm uppercase hover:scale-110 transition-transform flex items-center space-x-2`}
                  title={`${profile.network}: ${profile.username}`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{profile.network}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-8 space-y-12 relative" style={{ zIndex: 1 }}>
        {/* Summary */}
        <section>
          <div className="bg-red-400 p-4 border-4 border-black transform -skew-x-3 inline-block mb-6">
            <h2 className="text-3xl font-black uppercase">ABOUT ME</h2>
          </div>
          <div className="bg-gray-100 p-6 border-4 border-black">
            <p className="text-lg font-bold leading-relaxed">
              {data.basics.summary}
            </p>
          </div>
        </section>

        {/* Work Experience */}
        {data.work && data.work.length > 0 && (
          <section>
            <div className="bg-orange-400 p-4 border-4 border-black transform skew-x-3 inline-block mb-6">
              <h2 className="text-3xl font-black uppercase">WORK STUFF</h2>
            </div>
            <div className="space-y-6">
              {data.work.map((job, index) => {
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index} className={`${colorClass} p-6 border-4 border-black transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black uppercase">{job.position}</h3>
                        <p className="text-xl font-bold">{job.name}</p>
                      </div>
                      <div className="bg-black text-white p-2 border-2 border-black font-black text-sm uppercase mt-2 md:mt-0">
                        {formatDateRange(job.startDate, job.endDate)}
                      </div>
                    </div>
                    <p className="font-bold mb-4">{job.summary}</p>
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="space-y-2">
                        {job.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="bg-black text-white w-6 h-6 flex items-center justify-center font-black text-xs">
                              {idx + 1}
                            </span>
                            <span className="font-bold">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <div className="bg-cyan-400 p-4 border-4 border-black transform -skew-x-3 inline-block mb-6">
              <h2 className="text-3xl font-black uppercase">SCHOOL</h2>
            </div>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-yellow-200 p-6 border-4 border-black">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-xl font-black uppercase">
                        {edu.studyType} in {edu.area}
                      </h3>
                      <p className="text-lg font-bold">{edu.institution}</p>
                      {edu.score && (
                        <p className="font-bold">GPA: {edu.score}</p>
                      )}
                    </div>
                    <div className="bg-black text-white p-2 border-2 border-black font-black text-sm uppercase mt-2 md:mt-0">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <div className="bg-green-400 p-4 border-4 border-black transform skew-x-3 inline-block mb-6">
              <h2 className="text-3xl font-black uppercase">SKILLS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.skills.map((skill, index) => {
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index} className={`${colorClass} p-4 border-4 border-black transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
                    <h3 className="text-xl font-black uppercase mb-2">{skill.name}</h3>
                    <div className="bg-black text-white p-2 border-2 border-black font-black text-xs uppercase mb-3">
                      {skill.level}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skill.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-white border-2 border-black px-2 py-1 font-bold text-xs uppercase"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <div className="bg-purple-400 p-4 border-4 border-black transform -skew-x-3 inline-block mb-6">
              <h2 className="text-3xl font-black uppercase">PROJECTS</h2>
            </div>
            <div className="space-y-6">
              {data.projects.map((project, index) => {
                const colorClass = colors[(index + 2) % colors.length];
                
                return (
                  <div key={index} className={`${colorClass} p-6 border-4 border-black`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black uppercase">{project.name}</h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-black text-white p-2 border-2 border-black font-black text-xs uppercase inline-block mt-2 hover:scale-105 transition-transform"
                          >
                            VIEW PROJECT
                          </a>
                        )}
                      </div>
                      <div className="bg-black text-white p-2 border-2 border-black font-black text-sm uppercase mt-2 md:mt-0">
                        {formatDateRange(project.startDate, project.endDate)}
                      </div>
                    </div>
                    <p className="font-bold mb-4">{project.description}</p>
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="space-y-2">
                        {project.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="bg-black text-white w-6 h-6 flex items-center justify-center font-black text-xs">
                              ★
                            </span>
                            <span className="font-bold">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section>
            <div className="bg-red-400 p-4 border-4 border-black transform skew-x-3 inline-block mb-6">
              <h2 className="text-3xl font-black uppercase">AWARDS</h2>
            </div>
            <div className="space-y-4">
              {data.awards.map((award, index) => {
                const colorClass = colors[(index + 4) % colors.length];
                
                return (
                  <div key={index} className={`${colorClass} p-4 border-4 border-black transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="text-xl font-black uppercase">{award.title}</h3>
                        <p className="text-lg font-bold">{award.awarder}</p>
                        <p className="font-bold">{award.summary}</p>
                      </div>
                      <div className="bg-black text-white p-2 border-2 border-black font-black text-sm uppercase mt-2 md:mt-0">
                        {formatDate(award.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
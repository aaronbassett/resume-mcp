import type { FC } from 'react';
import { useState, useEffect } from 'react';
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
  Users,
  Star,
  Zap
} from 'lucide-react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import type { ResumeData } from '../../../types/resume';

interface ZineStyleProps {
  data: ResumeData;
}

// SVG Doodle Components inspired by the attached images
const DoodleArrow: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="40" height="30" viewBox="0 0 40 30" fill="none">
    <path d="M5 15 L30 15 M25 10 L30 15 L25 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoodleStarburst: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="25" height="25" viewBox="0 0 25 25" fill="none">
    <path d="M12.5 2 L12.5 23 M2 12.5 L23 12.5 M5.5 5.5 L19.5 19.5 M19.5 5.5 L5.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DoodleSpiral: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M15 15 Q20 10 20 15 Q20 20 15 20 Q10 20 10 15 Q10 10 15 10 Q18 10 18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const DoodleSquiggle: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="35" height="15" viewBox="0 0 35 15" fill="none">
    <path d="M2 7.5 Q8 2 14 7.5 Q20 13 26 7.5 Q32 2 33 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const DoodleCircle: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const DoodleHeart: FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute ${className}`} width="20" height="18" viewBox="0 0 20 18" fill="none">
    <path d="M10 16 C10 16 2 10 2 6 C2 3 4 2 6 2 C8 2 10 4 10 4 C10 4 12 2 14 2 C16 2 18 3 18 6 C18 10 10 16 10 16 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>
  </svg>
);

export const ZineStyle: FC<ZineStyleProps> = ({ data }) => {
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    // Trigger annotations after component mounts
    const timer = setTimeout(() => setShowAnnotations(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: '2-digit', 
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

  return (
    <div className="max-w-5xl mx-auto bg-white text-black relative overflow-hidden" style={{ fontFamily: 'Courier New, monospace' }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)`
      }}></div>
      
      {/* Header */}
      <div className="relative bg-black text-white p-6 transform -rotate-1 mb-8">
        <div className="transform rotate-1">
          <RoughNotation type="highlight" show={showAnnotations} color="#ff6b6b" animationDelay={200}>
            <h1 
              className="text-4xl md:text-6xl font-black mb-2 transform -skew-x-12 relative"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {data.basics.name.toUpperCase()}
            </h1>
          </RoughNotation>
          <div className="bg-yellow-400 text-black p-2 inline-block transform rotate-2 border-2 border-black relative">
            <p 
              className="text-lg font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {data.basics.label}
            </p>
          </div>
        </div>
        
        {/* Scattered contact info */}
        <div className="mt-6 relative">
          <div className="absolute top-0 left-0 bg-red-500 p-2 transform -rotate-12 border-2 border-white">
            <Mail className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.email}</span>
          </div>
          <div className="absolute top-8 right-0 bg-blue-500 p-2 transform rotate-6 border-2 border-white">
            <Phone className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.phone}</span>
          </div>
          <div className="absolute bottom-0 left-1/3 bg-green-500 p-2 transform -rotate-6 border-2 border-white">
            <MapPin className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.location.city}</span>
          </div>
          {data.basics.url && (
            <div className="absolute bottom-8 right-1/4 bg-purple-500 p-2 transform rotate-12 border-2 border-white">
              <Globe className="h-4 w-4 inline mr-1" />
              <span className="text-xs font-bold">{data.basics.url.replace(/^https?:\/\//, '').substring(0, 15)}</span>
            </div>
          )}
        </div>
        
        <div className="h-20"></div> {/* Spacer for absolute positioned elements */}

        {data.basics.profiles && data.basics.profiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 relative">
            {data.basics.profiles.map((profile, index) => {
              const IconComponent = getSocialIcon(profile.network);
              const colors = ['bg-pink-400', 'bg-cyan-400', 'bg-yellow-400', 'bg-lime-400'];
              const rotations = ['rotate-3', '-rotate-2', 'rotate-6', '-rotate-3'];
              
              return (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${colors[index % colors.length]} text-black p-2 border-2 border-black transform ${rotations[index % rotations.length]} hover:scale-110 transition-transform`}
                  title={`${profile.network}: ${profile.username}`}
                >
                  <IconComponent className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}

        {/* Header Doodles */}
        <DoodleStarburst className="top-4 right-8 text-yellow-400" />
        <DoodleSpiral className="bottom-4 left-8 text-pink-400" />
      </div>

      <div className="relative px-6 pb-8 space-y-8">
        {/* Summary */}
        <section className="relative">
          <div className="bg-yellow-200 p-4 border-4 border-black transform rotate-1 relative">
            <RoughNotation type="underline" show={showAnnotations} color="#ff6b6b" animationDelay={600}>
              <h2 
                className="text-2xl font-black mb-3 transform -skew-x-6"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                ABOUT ME!!!
              </h2>
            </RoughNotation>
            <p 
              className="leading-relaxed font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {data.basics.summary}
            </p>
            <DoodleHeart className="-top-2 -right-2 text-red-500" />
            <DoodleCircle className="-bottom-2 -left-2 text-blue-500" />
          </div>
          <DoodleArrow className="top-0 -right-12 text-gray-600 transform rotate-45" />
        </section>

        {/* Work Experience and Skills - Two Column Layout */}
        {data.work && data.work.length > 0 && (
          <section className="relative">
            <RoughNotation type="box" show={showAnnotations} color="#4ecdc4" animationDelay={800}>
              <h2 
                className="text-3xl font-black mb-6 transform -rotate-2 bg-red-400 p-3 inline-block border-3 border-black"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                WORK STUFF
              </h2>
            </RoughNotation>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Work Experience Column */}
              <div className="space-y-6">
                {data.work.map((job, index) => {
                  const colors = ['bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100'];
                  const rotations = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'];
                  
                  return (
                    <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                        <div>
                          <RoughNotation 
                            type="highlight" 
                            show={showAnnotations} 
                            color="#ffd93d" 
                            animationDelay={1000 + index * 200}
                          >
                            <h3 
                              className="text-xl font-black"
                              style={{ fontFamily: 'Arial Black, sans-serif' }}
                            >
                              {job.position}
                            </h3>
                          </RoughNotation>
                          <p 
                            className="text-lg font-bold"
                            style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          >
                            @ {job.name}
                          </p>
                        </div>
                        <div className="bg-black text-white p-1 transform rotate-6 font-bold text-sm">
                          {formatDateRange(job.startDate, job.endDate)}
                        </div>
                      </div>
                      <p className="font-bold mb-3">{job.summary}</p>
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="space-y-2">
                          {job.highlights.slice(0, 2).map((highlight, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <Star className="h-4 w-4 mt-1 flex-shrink-0" />
                              <span className="font-bold text-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <DoodleSquiggle className="-top-1 -right-1 text-gray-500" />
                      {index % 2 === 0 && <DoodleSpiral className="-bottom-1 -left-1 text-purple-500" />}
                    </div>
                  );
                })}
              </div>

              {/* Skills Column */}
              {data.skills && data.skills.length > 0 && (
                <div className="space-y-6">
                  <RoughNotation type="circle" show={showAnnotations} color="#ff6b6b" animationDelay={1400}>
                    <h3 
                      className="text-2xl font-black mb-4 bg-green-400 p-2 inline-block border-2 border-black transform rotate-1"
                      style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                    >
                      SKILLS!!!
                    </h3>
                  </RoughNotation>
                  
                  {data.skills.map((skill, index) => {
                    const colors = ['bg-red-100', 'bg-blue-100', 'bg-yellow-100', 'bg-green-100'];
                    const rotations = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2'];
                    
                    return (
                      <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`}>
                        <h4 
                          className="text-lg font-black mb-2"
                          style={{ fontFamily: 'Arial Black, sans-serif' }}
                        >
                          {skill.name}
                        </h4>
                        <div className="bg-black text-white p-1 inline-block font-bold text-xs mb-3 transform rotate-3">
                          {skill.level}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skill.keywords.slice(0, 4).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="bg-white border-2 border-black px-2 py-1 font-bold text-xs transform hover:rotate-6 transition-transform"
                              style={{ fontFamily: 'Courier New, monospace' }}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <DoodleCircle className="-top-1 -right-1 text-blue-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scattered Doodles */}
            <DoodleArrow className="top-20 right-1/3 text-orange-500 transform -rotate-12" />
            <DoodleStarburst className="bottom-10 left-1/4 text-green-500" />
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="relative">
            <h2 
              className="text-3xl font-black mb-6 transform rotate-1 bg-blue-400 p-3 inline-block border-3 border-black"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              SCHOOL
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-yellow-100 p-4 border-3 border-black transform -rotate-1 relative">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <RoughNotation 
                        type="underline" 
                        show={showAnnotations} 
                        color="#6bcf7f" 
                        animationDelay={1800}
                      >
                        <h3 
                          className="text-lg font-black"
                          style={{ fontFamily: 'Arial Black, sans-serif' }}
                        >
                          {edu.studyType} in {edu.area}
                        </h3>
                      </RoughNotation>
                      <p 
                        className="font-bold"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        {edu.institution}
                      </p>
                      {edu.score && (
                        <p className="font-bold text-sm">GPA: {edu.score}</p>
                      )}
                    </div>
                    <div className="bg-black text-white p-1 transform -rotate-3 font-bold text-sm mt-2 md:mt-0">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </div>
                  </div>
                  <DoodleHeart className="-top-1 -right-1 text-pink-500" />
                </div>
              ))}
            </div>
            <DoodleSpiral className="-top-4 -right-8 text-purple-500" />
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="relative">
            <RoughNotation type="strike-through" show={showAnnotations} color="#ff6b6b" animationDelay={2000}>
              <h2 
                className="text-3xl font-black mb-6 transform rotate-2 bg-purple-400 p-3 inline-block border-3 border-black"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                COOL PROJECTS
              </h2>
            </RoughNotation>
            <div className="space-y-6">
              {data.projects.map((project, index) => {
                const colors = ['bg-cyan-100', 'bg-pink-100', 'bg-lime-100', 'bg-orange-100'];
                const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
                
                return (
                  <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                      <div>
                        <h3 
                          className="text-xl font-black"
                          style={{ fontFamily: 'Arial Black, sans-serif' }}
                        >
                          {project.name}
                        </h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-black text-white p-1 inline-block font-bold text-xs mt-1 transform -rotate-3 hover:rotate-6 transition-transform"
                          >
                            CHECK IT OUT!
                          </a>
                        )}
                      </div>
                      <div className="bg-black text-white p-1 transform rotate-6 font-bold text-sm mt-2 md:mt-0">
                        {formatDateRange(project.startDate, project.endDate)}
                      </div>
                    </div>
                    <p className="font-bold mb-3">{project.description}</p>
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="space-y-2">
                        {project.highlights.slice(0, 2).map((highlight, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Zap className="h-4 w-4 mt-1 flex-shrink-0" />
                            <span className="font-bold text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <DoodleSquiggle className="-top-1 -right-1 text-orange-500" />
                    <DoodleCircle className="-bottom-1 -left-1 text-green-500" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section className="relative">
            <h2 
              className="text-3xl font-black mb-6 transform -rotate-2 bg-orange-400 p-3 inline-block border-3 border-black"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              AWARDS!
            </h2>
            <div className="space-y-4">
              {data.awards.map((award, index) => {
                const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
                
                return (
                  <div key={index} className={`bg-yellow-200 p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 
                          className="text-lg font-black"
                          style={{ fontFamily: 'Arial Black, sans-serif' }}
                        >
                          {award.title}
                        </h3>
                        <p 
                          className="font-bold"
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                        >
                          {award.awarder}
                        </p>
                        <p className="font-bold text-sm">{award.summary}</p>
                      </div>
                      <div className="bg-black text-white p-1 transform rotate-12 font-bold text-sm mt-2 md:mt-0">
                        {formatDate(award.date)}
                      </div>
                    </div>
                    <DoodleStarburst className="-top-1 -right-1 text-yellow-600" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Additional Sections - Mixed Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section className="relative">
              <RoughNotation type="box" show={showAnnotations} color="#ff9ff3" animationDelay={2400}>
                <h3 
                  className="text-xl font-black mb-4 bg-red-300 p-2 inline-block border-2 border-black transform rotate-1"
                  style={{ fontFamily: 'Arial Black, sans-serif' }}
                >
                  LANGUAGES
                </h3>
              </RoughNotation>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="bg-white border-2 border-black p-2 transform -rotate-1 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-black">{lang.language}</span>
                      <span className="font-bold text-sm">{lang.fluency}</span>
                    </div>
                    <DoodleHeart className="-top-1 -right-1 text-red-400" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <section className="relative">
              <h3 
                className="text-xl font-black mb-4 bg-blue-300 p-2 inline-block border-2 border-black transform -rotate-1"
                style={{ fontFamily: 'Arial Black, sans-serif' }}
              >
                INTERESTS
              </h3>
              <div className="space-y-3">
                {data.interests.map((interest, index) => (
                  <div key={index} className="bg-white border-2 border-black p-2 transform rotate-1 relative">
                    <h4 className="font-black mb-1">{interest.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {interest.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-200 border border-black px-1 py-0.5 font-bold text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <DoodleCircle className="-top-1 -right-1 text-blue-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Scattered Doodles */}
          <DoodleArrow className="top-1/2 left-1/2 text-gray-400 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
        </div>

        {/* Footer doodles */}
        <div className="text-center space-x-4 mt-12 relative">
          <div className="flex justify-center items-center space-x-8">
            <DoodleStarburst className="relative text-red-500" />
            <DoodleHeart className="relative text-pink-500" />
            <DoodleSpiral className="relative text-blue-500" />
            <DoodleCircle className="relative text-green-500" />
            <DoodleSquiggle className="relative text-purple-500" />
            <DoodleArrow className="relative text-orange-500" />
          </div>
          
          <RoughNotationGroup show={showAnnotations}>
            <div className="mt-8 text-center">
              <RoughNotation type="highlight" color="#ffd93d" animationDelay={2800}>
                <p 
                  className="text-2xl font-black transform -rotate-1 inline-block"
                  style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                >
                  THANKS FOR READING!
                </p>
              </RoughNotation>
            </div>
          </RoughNotationGroup>
        </div>
      </div>
    </div>
  );
};
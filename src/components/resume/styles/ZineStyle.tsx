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
        <section className="relative" style={{ zIndex: 1 }}>
          <div className="bg-yellow-200 p-4 border-4 border-black transform rotate-1 relative" style={{ zIndex: 1 }}>
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
          </div>

          {/* Awesome Word SVG - Right side of summary */}
          <div className="absolute -right-16 top-12 opacity-50 mix-blend-multiply" style={{ width: '130px', height: '100px', zIndex: 2 }}>
            <img src="/awesome.svg" alt="" className="w-full h-full" />
          </div>
        </section>

        {/* Work Experience and Skills - Two Column Layout */}
        {data.work && data.work.length > 0 && (
          <section className="relative" style={{ zIndex: 1 }}>
            <RoughNotation type="box" show={showAnnotations} color="#4ecdc4" animationDelay={800}>
              <h2 
                className="text-3xl font-black mb-6 transform -rotate-2 bg-red-400 p-3 inline-block border-3 border-black"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif', zIndex: 1 }}
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
                    <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`} style={{ zIndex: 1 }}>
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
                      <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`} style={{ zIndex: 1 }}>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Boom Word SVG - Top right of work section */}
            <div className="absolute -top-8 -right-12 opacity-60 mix-blend-overlay" style={{ width: '120px', height: '90px', zIndex: 2 }}>
              <img src="/boom.svg" alt="" className="w-full h-full" />
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="relative" style={{ zIndex: 1 }}>
            <h2 
              className="text-3xl font-black mb-6 transform rotate-1 bg-blue-400 p-3 inline-block border-3 border-black"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              SCHOOL
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-yellow-100 p-4 border-3 border-black transform -rotate-1 relative" style={{ zIndex: 1 }}>
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
                </div>
              ))}
            </div>

            {/* Overthinking Word SVG - Left side of education */}
            <div className="absolute top-8 -left-20 opacity-45 mix-blend-overlay" style={{ width: '140px', height: '110px', zIndex: 2 }}>
              <img src="/overthinking.svg" alt="" className="w-full h-full" />
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="relative" style={{ zIndex: 1 }}>
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
                  <div key={index} className={`${colors[index % colors.length]} p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`} style={{ zIndex: 1 }}>
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
                            className="bg-black text-white p-1 inline-block font-bold text-xs mt-2 hover:scale-105 transition-transform"
                          >
                            VIEW PROJECT
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
                  </div>
                );
              })}
            </div>

            {/* You Are Enough Word SVG - Top right of projects */}
            <div className="absolute -top-12 right-40 opacity-40 mix-blend-darken" style={{ width: '400px', zIndex: 2 }}>
              <img src="/you-are-enough.svg" alt="" className="w-full h-full" />
            </div>
          </section>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section className="relative" style={{ zIndex: 1 }}>
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
                  <div key={index} className={`bg-yellow-200 p-4 border-3 border-black transform ${rotations[index % rotations.length]} relative`} style={{ zIndex: 1 }}>
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
                  </div>
                );
              })}
            </div>

            {/* Oops Word SVG - Right side of awards */}
            <div className="absolute top-12 -right-16 opacity-55 mix-blend-multiply" style={{ width: '110px', height: '85px', zIndex: 2 }}>
              <img src="/oops.svg" alt="" className="w-full h-full" />
            </div>
          </section>
        )}

        {/* Additional Sections - Mixed Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative" style={{ zIndex: 1 }}>
          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section className="relative" style={{ zIndex: 1 }}>
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
                  <div key={index} className="bg-white border-2 border-black p-2 transform -rotate-1 relative" style={{ zIndex: 1 }}>
                    <div className="flex justify-between items-center">
                      <span className="font-black">{lang.language}</span>
                      <span className="font-bold text-sm">{lang.fluency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <section className="relative" style={{ zIndex: 1 }}>
              <h3 
                className="text-xl font-black mb-4 bg-blue-300 p-2 inline-block border-2 border-black transform -rotate-1"
                style={{ fontFamily: 'Arial Black, sans-serif' }}
              >
                INTERESTS
              </h3>
              <div className="space-y-3">
                {data.interests.map((interest, index) => (
                  <div key={index} className="bg-white border-2 border-black p-2 transform rotate-1 relative" style={{ zIndex: 1 }}>
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
                  </div>
                ))}
              </div>

              {/* Yay Word SVG - Bottom right of interests */}
              <div className="absolute -bottom-8 -right-12 opacity-65 mix-blend-overlay" style={{ width: '100px', height: '80px', zIndex: 2 }}>
                <img src="/yay.svg" alt="" className="w-full h-full" />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 relative" style={{ zIndex: 1 }}>
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
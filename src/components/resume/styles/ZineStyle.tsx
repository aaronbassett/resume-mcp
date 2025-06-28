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

// Custom SVG Doodle Components using the provided SVGs
const AwesomeDoodle: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute ${className}`} style={{ width: '80px', height: '60px' }}>
    <svg viewBox="0 0 354.71 327.38" className="w-full h-full">
      <path fill="#f4eae1" d="M104.89,327.24c40.02-2.11,172.02-26.86,196.55-34.75,49.84-16.03,56.73-36.3,52.04-83.19-1.69-16.98-19.69-139.57-33.67-171.05C304.06,2.81,277.56-1.91,240.99.55c-17.78,1.19-136.67,15.18-173.01,24.98C4.39,42.69-2.89,84.45.78,132.1c1.96,25.39,5.98,56.59,10.25,82.1,8.19,49.01,24.76,116.7,93.86,113.03Z"/>
      <path fill="#fff" d="M43.69,140.99c-.1-.54-.39-2.17-.42-2.34-1.21-9.85-2.08-19.94-2.58-30.1.05-.75.11-3.56.05-3.93.23-.78,1.55-9.03,2-11.72-.03-.18.26-.6.23-.78,6.48-15.88,18.85-27.97,38.93-26.15.18-.03.4.11.57.08,2.47.31,5.17.75,7.59,1.81,6.38,3.33,10.64,9.46,14.51,15.49,7.38,12.09,8.5,27.74,11.28,41.21.34.86,1.58,6.8,1.68,7.33.13.73,1.65,9.21,2.19,12.28.55,3.08,1.94,10.84,2.04,11.38.48,2.71,2.3,15.98,2.63,18.9.56,4.19-2.77,8.51-6.92,9.25-1.08.2,2.99-.9-10.35.55,0,0-1.71-.25-2.31-.52-3.34-.9-3.79-1.38-5.24-4.28-.22-1.26-1.56-6.61-1.94-7.66-.09-.55-.66-2.69-.76-3.22-.27-.52-.81-.43-1-.39-.17.03-.69.3-.87.34-.54.09-14.98,2.68-15.49,2.96-.54.09-.23.78-.2.96.03.19.16.91.16.91.6,2.32,2.25,9.48,2.53,9.98.06.36,1.42,2.73,1.45,2.92.03.18.16.9.19,1.07.2,1.09.07,1.48-.94,2.04-3.08.54-9.89,3.07-13.14,3.65-.36.06-4.87.88-6.5,1.17-.9.16-5.41.97-6.31,1.12-1.73-.25-2.18-1.66-2.6-3.08-2.93-17.36-7.4-34.07-10.47-51.23ZM76.08,144.9s5.29-.57,5.47-.6c.37-.07,7.95-1.42,8.12-1.45-.04-1.3-.88-8.05-1.14-9.48,0,0-.13-.73-.16-.91-.58-3.24-2.01-7.08-2.59-10.34-1.15-5.39-1.72-10.69-3.77-15.92-2.61-11.46-6.39-14.88-9.15-13.65-2.77,1.24-4.72,7-4.05,14.88-.1,1.52-.14,5.43-.08,5.8.13,3.89.66,7.89,1.37,11.87,1.17,6.5,2.42,13.54,4.64,19.67.42.3.78.23,1.33.13Z"/>
    </svg>
  </div>
);

const BoomDoodle: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute ${className}`} style={{ width: '70px', height: '65px' }}>
    <svg viewBox="0 0 358.34 349.88" className="w-full h-full">
      <path fill="#f4eae1" d="M343.98,204.28C297.5,136.7,182.59,34.71,175.86,29.44,125.97-19.5,94.04,3.52,71.67,20.74,48.1,38.89,19.54,71.38,6.52,99.49c-21.19,45.73,14.07,62.67,37.38,84.07,16.45,15.11,109.69,94.54,138,121.58,45.61,43.55,65.2,55.92,97.32,34.45,9.92-6.62,50.72-47.44,57.05-57.02,18.46-27.96,34.86-38.82,7.71-78.28Z"/>
      <path fill="#fff" d="M50.35,93.19c2.14-2.28,7.94-8.44,8.19-8.71,5.41-6.02,30.42-34.52,35.44-40.65.38-.4,2.01-2.15,2.38-2.54.51-.54,2.15-2.28,2.27-2.41,1.78-1.61,9.47-9.53,11.23-11.15,6.32-2.15,18.12,9.2,21.47,12.35,5.09,4.78,9.29,10.25,13.24,15.98,9.53,13.75,9.32,23.64-2.27,35.98-9.19,9.78-21.44,9.38-33.38,5.97-.26,0-.52.01-.65-.11l-.13.14c-.38.4,4.93,12.2,5.01,15.06.79,8.56-2.39,15.17-8.18,21.33-.76.8-2.4,2.55-2.52,2.67-1.14,1.21-4.93,4.45-5.45,4.73l-10.64,5.14c-.26.01-6.73,1.25-9.32,1.59-9.06,1.33-22.43-5.94-29.21-10.54-2.39-1.75-13.19-10.14-15.33-11.89-.14-.12-1.61-1.51-2.28-2.14-3.89-3.65-5.06-3.74-1.42-7.89.51-.54,4.65-5.48,5.15-6.02,0,0,.76-.8,1.01-1.07,5.16-5.49,10.22-10.33,15.38-15.83ZM105.35,75.22c6.21,7.35,24.6-3.62,13.85-14.74-.13-.13-.52.01-.52.01l-13.1,13.94-.23.79ZM64.1,121.52c12.31,10.81,36.86-11.55,22.15-24.37-.13-.12-.4-.11-.4-.11l-.52.02c-3.3,2.97-4.81,4.57-7.7,7.66-4.03,4.28-9.53,11.49-13.82,15.78-.26.27.16.91.28,1.03Z"/>
    </svg>
  </div>
);

const OopsDoodle: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute ${className}`} style={{ width: '90px', height: '50px' }}>
    <svg viewBox="0 0 377.46 247.5" className="w-full h-full">
      <path fill="#f4eae1" d="M58.13,71.7C9.87,94.62-.85,99.14.05,144.47c.41,19.93,6.79,40.45,14.4,57.7,19.49,44.22,51.97,52.77,94.81,39.82,69.96-21.13,213.26-75.03,228.56-81.19,46.87-18.84,50.6-50.79,19.48-119.24-11.14-24.51-24.89-38.23-49.6-41.32-37.62-4.7-224.79,59.67-249.57,71.45Z"/>
      <path fill="#fff" d="M44.88,112.58c26.09-11.95,36.15-3.64,48.42,19.57.7,1.16,2.82,5.7,2.97,6.18.1.32,1.49,4.21,1.98,5.8,5.23,16.75,9.58,30.65,7.29,48.36-.31,2.34-.24,4.75-1.03,7.25-.11.21-1.04,2.23-1.46,2.54-4.48,7.3-10.52,11.27-18.74,13.83-14.39,4.49-23.47-1.86-31.51-13.75-.41-.74-4.07-6.36-5.09-7.95-.31-.42-.81-1.48-.9-1.8l-8.72-20.69s-.4-1.26-.59-1.89c-4.93-15.8-11.74-48.71,7.38-57.46ZM79.24,188.22c7.64-2.74.04-24.3-2.43-31.68-.2-.63-.4-1.25-.5-1.57-1.38-4.43-7.31-22.86-14.58-20.59-5.21,1.62-.29,22.98.75,26.29,7.45,26.64,10.95,29.53,16.76,27.56Z"/>
    </svg>
  </div>
);

const OverthinkingDoodle: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute ${className}`} style={{ width: '150px', height: '40px' }}>
    <svg viewBox="0 0 814.38 213.79" className="w-full h-full">
      <path fill="#f4eae1" d="M801.83,36.91c-.53-.5-1.1-.93-1.66-1.41-7.27-8.16-17.75-13.8-29.55-15.6-2.02-.51-4.07-.92-6.18-1.13-1.41-.14-2.83-.21-4.35-.21-4.04,0-8.01.56-11.78,1.66-9.12,2.65-17.63,7.65-24.98,14.07-12.25,8.44-26.61,17.26-37,8.34-2.44-2.09-11.94-15.71-15.87-19.09-1.31-1.12-2.72-2.17-4.21-3.11-2.04-1.58-4.24-2.98-6.84-3.97-9.34-3.53-18.17-3.92-26.31-2.02-12.2,2.86-15.97,3.64-21.56-2.41-6.94-7.54-15.85-11.36-26.52-11.36-3.41,0-14.35-.65-23.77,8.42-4.73,4.55-9.16,9.03-13.06,12.83-10.59,10.3-19.63,13.33-32.33.35-1.57-1.6-3.16-3.31-4.81-5.07-10.4-11.16-19.47-15.38-34.57-16.6-24.15-1.95-48.98,1.58-73.23,1.03-10.15-.23-28.75-.7-44.14.32-48.67,3.24-54,29.78-105.71,29.62-23.48-.07-46.8,3.03-69.9,2.33-24.55-.74-43.38-7.31-55.36-16.78-8.21-6.5-16.88-10.78-25.67-13.15-27.69-7.49-63.81,5.55-85.02,36.31-22.94,33.27-24.51,84.86,2.85,115.66,6.32,7.11,16.17,11.74,26.37,13.64.71.23,1.4.5,2.12.7,4.34,1.22,9.24,1.82,14.98,1.82,4.62,0,13.55-.42,21.39-3.22,11.65-4.16,23.18-11.51,33.15-20.68,2.53,5.53,5.78,10.55,10.57,13.7,19.69,12.96,43.77,6.22,65.86,5.52,26.09-.83,50.09,7.51,76.35,1.05,5.79-1.42,41.57-5.42,48.12-2.26,32.19,15.55,81.39,10.35,110.94,8.87,15.48-.78,33.17-1.75,47.16-9.13,15.87-8.36,40.18-9.51,51.27,2.64,2.58,2.81,11.01,12.21,32.02,14.14,12.47,1.14,27.92-2.62,52.85-5.09,13.76-1.36,26.85-3.35,35.18-6.24,12.78-4.43,28.8-15.12,33.27.76-.03.18-.09.33-.11.51-2.08,15.44,6.14,30.89,20.02,37.57,4.92,2.36,10.28,3.56,15.94,3.56,5.12,0,10.4-1.01,15.73-3,20.12-7.58,40.83-24.7,54.04-44.69,5.02-7.6,13.72-25.45,16.92-34.7,2.69-7.78,5.53-18.87,6.89-26.97,1.56-9.28,3.07-26.29,3.05-34.32-.01-7.99-.03-21.36-12.55-33.2Z"/>
      <path fill="#fff" d="M108.58,46.16c-7.03-6.57-14.14-9.85-25.65-11.83-3.85-.67-6.66-1.03-8.78-1.03-.71,0-1.34.04-1.91.12-2.28.32-3.53,1.3-4.59,3.06-.5.82-2.35,2.46-4.11,3.64-4.32,2.88-11.42,10.45-15.42,16.41-6.68,10-11.69,21.91-13.45,32.01-1.15,6.55-.77,18.84.76,24.99,1.24,5.02,4.1,11.97,6.36,15.49,3.45,5.38,9.19,9.6,15.42,11.35,4.03,1.13,13.35.73,17.49-.75,12.02-4.3,24.59-14.14,32.86-25.71,5.69-7.96,10.77-19.14,12.08-26.59.97-5.51,1.29-15.17.61-19.05-1.4-7.98-6.12-16.94-11.68-22.13ZM100.71,94.13c-6.65,13.07-15.59,22.43-26.74,28-4.27,2.13-5.45,2.48-8.69,2.61-6.58.27-9.34-1.85-12.67-9.74-2.55-6.05-3.14-9.41-3.14-18.03,0-6.29.21-8.42,1.2-12.1,2.67-9.98,8.88-21.96,14.79-28.54,2.29-2.54,2.88-2.94,3.7-2.51,1.52.81,5.15.62,6.62-.34.73-.48,1.93-2.04,2.65-3.47.97-1.92,1.24-2.42,2.12-2.4.29,0,.65.07,1.13.16,7.65,1.44,15.27,5.95,18.81,11.14,3.81,5.56,4.67,8.45,4.63,15.44-.04,8.05-1.29,13.6-4.43,19.79Z"/>
    </svg>
  </div>
);

const YouAreEnoughDoodle: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute ${className}`} style={{ width: '65px', height: '55px' }}>
    <svg viewBox="0 0 345.57 287.81" className="w-full h-full">
      <path fill="#f4eae1" d="M341.77,107.3c1.51-3.3,2.6-6.69,3.23-10.04,1.74-9.45-.49-19.19-6.12-26.72-5.69-7.6-14.52-12.54-24.04-13.53-1.22-.14-2.47-.2-3.75-.2-.54,0-1.55.02-2.09.06-7.8.46-15.31,3.47-21.92,7.88-2.15-.61-4.38-1.03-6.67-1.22-3.43-2.03-7.27-3.38-11.34-3.96-1.83-7.89-4.72-17.57-8.82-23.48-5.8-8.42-15.32-13.71-25.54-14.17-.45-.02-.91-.03-1.35-.03-.86,0-2.19.06-3.04.14-8.56.8-15.72,4.37-21.92,10.92-4.16,4.41-8.08,10.12-12.17,17.77.88-7.92.2-16.17-2.72-24.22-4.07-11.2-14.8-18.73-26.7-18.73-3.42,0-6.75.65-9.88,1.83-2.23-2.17-4.78-4.18-7.8-5.88-4.16-2.38-9.27-3.73-14.05-3.73-8.08,0-15.78,3.45-21.14,9.51-1.49,1.68-2.72,3.4-3.81,5.13-.09,0-.18-.03-.28-.03-7.26,0-13.91,2.79-18.94,7.37-4.59-2.42-9.77-3.73-15.31-3.73s-17.62,1.43-26.11,13.02c-4.99-3.31-10.9-5.18-17.04-5.19-12,0-23.44,7.23-28.42,17.87C1.03,50.26-.24,57.71.04,67.36c.27,9.57,1.72,15.77,5.54,23.69,5.18,10.73,14.07,18.81,24.73,22.59-1.12,4.6-2.41,9.32-3.41,12.49-6.05,19.23,3.08,30.54,9.08,35.59,1.21,1.02,2.51,1.88,3.83,2.7-2.72,8.4-4.79,17.06-6.78,28.1-1.62,8.95-2.17,12.95-2.43,20.53-.27,7.75-.68,19.45,10.04,30.15,8.29,8.28,17.24,9.51,22.03,10.16,2.47.34,4.91.41,6.52.41,1.15,0,2.24-.03,3.23-.1.64-.05,1.34-.12,2.06-.21,3.6,11.42,14.42,19.55,26.48,19.55h0c1.99,0,4.07-.23,6.02-.66,23.45-5.19,47.64-6.52,73.25-7.93,2.59-.13,5.28-.3,7.91-.46,2.14,8.9,8.05,16.74,16.49,20.82,4.19,2.01,8.74,3.02,13.52,3.02,4.25,0,8.59-.82,12.84-2.43,14.64-5.51,29.65-17.88,39.17-32.29,2.1-3.18,4.76-8.21,7.11-13.16,3.59-.18,7.16-.92,10.51-2.25,3.9,1.76,8.16,2.65,12.76,2.65,7.96,0,26.99-2.93,31.57-30.02,1.57-9.24,2.58-22.66-1.53-34.02-2.33-6.46-7.65-14.5-12.65-19.09-.76-.7-1.56-1.32-2.35-1.94,1.06-.27,14.26-3.81,22.08-12.71,7.15-8.13,9.57-19.16,6.49-29.46-.61-2.04-1.41-3.97-2.39-5.79Z"/>
      <path fill="#fff" d="M73.63,191.69c3.47-1.76,22.36-7.98,25.67-8.45,1.64-.23,3.19-1.16,3.76-2.25.52-.98.29-3.17-.42-3.95-1.13-1.25-2.21-1.56-5.38-1.54-5.56.03-13.22,2.05-20.15,5.32-1.97.93-3.62,1.65-3.68,1.58-.06-.05.44-2.23,1.08-4.82,1.05-4.19,3.79-12.76,6.39-19.95l.88-2.44,1.71-.5c.95-.28,3.69-.91,6.08-1.38,17.79-3.54,16.22-3.15,17.39-4.39,1.78-1.89,1.14-4.73-1.29-5.74-2.53-1.06-9.71-.78-16.54.62-1.99.41-3.72.75-3.84.75s-.22-.3-.22-.68c-.01-1.72-1.84-3.32-3.7-3.43-.26-.02-.52-.01-.78.04-1.06.21-3.05,1.93-3.05,2.66,0,.2-.54,1.17-1.21,2.17-.67.99-1.29,2.28-1.39,2.88-.14.88-.36,1.16-1.15,1.44-2.46.89-3.43,3.25-2.28,5.6l.67,1.4-1.71,4.12c-4.91,11.76-7.64,21.38-10.4,36.65-1.5,8.31-1.8,10.84-2,16.61-.23,6.69-.02,7.73,2.01,9.75,1.47,1.48,2.43,1.84,6.32,2.38,1.07.15,2.9.2,4.06.12,2.56-.19,9.6-1.62,13.09-2.67,2.81-.84,7.78-2.02,10.83-2.56,2.29-.41,3.35-.96,4.03-2.11,1-1.68.36-4.08-1.3-4.95-1.67-.86-7.15-.42-14.57,1.19-8.21,1.77-14.49,2.42-14.83,1.52-.3-.76.7-8.74,2.01-15.96,1.38-7.65,1.44-7.77,3.9-9.03Z"/>
    </svg>
  </div>
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
    <div className="max-w-5xl mx-auto bg-white text-black relative overflow-hidden" style={{ fontFamily: 'Courier New, monospace', zIndex: 1 }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)`
      }}></div>
      
      {/* Header */}
      <div className="relative bg-black text-white p-6 transform -rotate-1 mb-8" style={{ zIndex: 10 }}>
        <div className="transform rotate-1">
          <RoughNotation type="highlight" show={showAnnotations} color="#ff6b6b" animationDelay={200}>
            <h1 
              className="text-4xl md:text-6xl font-black mb-2 transform -skew-x-12 relative"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif', zIndex: 10 }}
            >
              {data.basics.name.toUpperCase()}
            </h1>
          </RoughNotation>
          <div className="bg-yellow-400 text-black p-2 inline-block transform rotate-2 border-2 border-black relative" style={{ zIndex: 10 }}>
            <p 
              className="text-lg font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {data.basics.label}
            </p>
          </div>
        </div>
        
        {/* Scattered contact info */}
        <div className="mt-6 relative" style={{ zIndex: 10 }}>
          <div className="absolute top-0 left-0 bg-red-500 p-2 transform -rotate-12 border-2 border-white" style={{ zIndex: 10 }}>
            <Mail className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.email}</span>
          </div>
          <div className="absolute top-8 right-0 bg-blue-500 p-2 transform rotate-6 border-2 border-white" style={{ zIndex: 10 }}>
            <Phone className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.phone}</span>
          </div>
          <div className="absolute bottom-0 left-1/3 bg-green-500 p-2 transform -rotate-6 border-2 border-white" style={{ zIndex: 10 }}>
            <MapPin className="h-4 w-4 inline mr-1" />
            <span className="text-xs font-bold">{data.basics.location.city}</span>
          </div>
          {data.basics.url && (
            <div className="absolute bottom-8 right-1/4 bg-purple-500 p-2 transform rotate-12 border-2 border-white" style={{ zIndex: 10 }}>
              <Globe className="h-4 w-4 inline mr-1" />
              <span className="text-xs font-bold">{data.basics.url.replace(/^https?:\/\//, '').substring(0, 15)}</span>
            </div>
          )}
        </div>
        
        <div className="h-20"></div> {/* Spacer for absolute positioned elements */}

        {data.basics.profiles && data.basics.profiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 relative" style={{ zIndex: 10 }}>
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
                  style={{ zIndex: 10 }}
                >
                  <IconComponent className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}

        {/* Header Doodles */}
        <AwesomeDoodle className="top-4 right-8 text-yellow-400" />
        <BoomDoodle className="bottom-4 left-8 text-pink-400" />
      </div>

      <div className="relative px-6 pb-8 space-y-8" style={{ zIndex: 1 }}>
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
          <YouAreEnoughDoodle className="top-0 -right-12 text-gray-600 transform rotate-45" />
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

            {/* Scattered Doodles */}
            <OopsDoodle className="top-20 right-1/3 text-orange-500 transform -rotate-12" />
            <OverthinkingDoodle className="bottom-10 left-1/4 text-green-500" />
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
            <BoomDoodle className="-top-4 -right-8 text-purple-500" />
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
                  </div>
                );
              })}
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
            </section>
          )}

          {/* Scattered Doodles */}
          <AwesomeDoodle className="top-1/2 left-1/2 text-gray-400 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
        </div>

        {/* Footer doodles */}
        <div className="text-center space-x-4 mt-12 relative" style={{ zIndex: 1 }}>
          <div className="flex justify-center items-center space-x-8">
            <YouAreEnoughDoodle className="relative text-red-500" />
            <BoomDoodle className="relative text-pink-500" />
            <OopsDoodle className="relative text-blue-500" />
            <AwesomeDoodle className="relative text-green-500" />
            <OverthinkingDoodle className="relative text-purple-500" />
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
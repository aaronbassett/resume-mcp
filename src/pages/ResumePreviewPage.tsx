import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ResumeHeader } from '../components/resume/ResumeHeader';
import { ResumeContent } from '../components/resume/ResumeContent';
import { ResumeFooter } from '../components/resume/ResumeFooter';
import { supabase } from '../lib/supabase';
import type { ResumeData, ResumeStyle } from '../types/resume';

// Mock resume data
const mockResumeData: ResumeData = {
  "basics": {
    "name": "John Doe",
    "label": "Senior Full Stack Developer",
    "image": "",
    "email": "john@gmail.com",
    "phone": "(912) 555-4321",
    "url": "https://johndoe.com",
    "summary": "Passionate full-stack developer with 8+ years of experience building scalable web applications and leading development teams. Expertise in modern JavaScript frameworks, cloud architecture, and agile methodologies. Proven track record of delivering high-quality software solutions that drive business growth and enhance user experience.",
    "location": {
      "address": "2712 Broadway St",
      "postalCode": "CA 94115",
      "city": "San Francisco",
      "countryCode": "US",
      "region": "California"
    },
    "profiles": [
      {
        "network": "LinkedIn",
        "username": "johndoe",
        "url": "https://linkedin.com/in/johndoe"
      },
      {
        "network": "GitHub",
        "username": "johndoe",
        "url": "https://github.com/johndoe"
      },
      {
        "network": "Twitter",
        "username": "john",
        "url": "https://twitter.com/john"
      }
    ]
  },
  "work": [
    {
      "name": "TechCorp Inc.",
      "position": "Senior Full Stack Developer",
      "url": "https://techcorp.com",
      "startDate": "2020-03-01",
      "endDate": "",
      "summary": "Lead development of enterprise-scale web applications serving 100k+ users. Architect and implement microservices infrastructure using Node.js, React, and AWS cloud services.",
      "highlights": [
        "Led a team of 5 developers in building a customer portal that increased user engagement by 40%",
        "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
        "Optimized database queries resulting in 60% improvement in application performance",
        "Mentored junior developers and established coding standards across the engineering team"
      ]
    },
    {
      "name": "StartupXYZ",
      "position": "Full Stack Developer",
      "url": "https://startupxyz.com",
      "startDate": "2018-01-01",
      "endDate": "2020-02-28",
      "summary": "Developed and maintained multiple web applications in a fast-paced startup environment. Worked directly with product managers and designers to deliver user-centric solutions.",
      "highlights": [
        "Built the company's main product from MVP to production serving 10k+ daily active users",
        "Implemented real-time features using WebSocket technology improving user experience",
        "Reduced application load time by 50% through code optimization and caching strategies",
        "Collaborated with cross-functional teams to deliver features on tight deadlines"
      ]
    },
    {
      "name": "Digital Agency Pro",
      "position": "Frontend Developer",
      "url": "https://digitalagencypro.com",
      "startDate": "2016-06-01",
      "endDate": "2017-12-31",
      "summary": "Specialized in creating responsive, interactive websites for diverse clients ranging from small businesses to Fortune 500 companies.",
      "highlights": [
        "Delivered 25+ client projects with 100% on-time completion rate",
        "Implemented modern frontend frameworks resulting in improved user engagement",
        "Collaborated with design team to ensure pixel-perfect implementation of mockups",
        "Established frontend development best practices and component libraries"
      ]
    }
  ],
  "volunteer": [
    {
      "organization": "Code for Good",
      "position": "Volunteer Developer",
      "url": "https://codeforgood.org/",
      "startDate": "2019-01-01",
      "endDate": "2021-12-31",
      "summary": "Contributed to open-source projects that benefit non-profit organizations and social causes.",
      "highlights": [
        "Developed a volunteer management system used by 15+ local non-profits",
        "Awarded 'Volunteer of the Year' for outstanding contribution to community projects"
      ]
    }
  ],
  "education": [
    {
      "institution": "University of California, Berkeley",
      "url": "https://berkeley.edu/",
      "area": "Computer Science",
      "studyType": "Bachelor of Science",
      "startDate": "2012-09-01",
      "endDate": "2016-05-31",
      "score": "3.8",
      "courses": [
        "Data Structures and Algorithms",
        "Database Systems",
        "Software Engineering",
        "Computer Networks",
        "Machine Learning Fundamentals"
      ]
    }
  ],
  "awards": [
    {
      "title": "Employee of the Year",
      "date": "2022-12-01",
      "awarder": "TechCorp Inc.",
      "summary": "Recognized for exceptional performance and leadership in delivering critical projects ahead of schedule."
    },
    {
      "title": "Best Innovation Award",
      "date": "2019-11-01",
      "awarder": "StartupXYZ",
      "summary": "Awarded for developing an innovative feature that increased user retention by 35%."
    }
  ],
  "certificates": [
    {
      "name": "AWS Certified Solutions Architect",
      "date": "2021-11-07",
      "issuer": "Amazon Web Services",
      "url": "https://aws.amazon.com/certification/"
    },
    {
      "name": "Google Cloud Professional Developer",
      "date": "2020-08-15",
      "issuer": "Google Cloud",
      "url": "https://cloud.google.com/certification"
    }
  ],
  "publications": [
    {
      "name": "Modern Web Development Best Practices",
      "publisher": "Tech Weekly",
      "releaseDate": "2021-10-01",
      "url": "https://techweekly.com/modern-web-dev",
      "summary": "Comprehensive guide covering modern frontend and backend development practices for scalable applications."
    }
  ],
  "skills": [
    {
      "name": "Frontend Development",
      "level": "Expert",
      "keywords": [
        "React",
        "Vue.js",
        "TypeScript",
        "JavaScript",
        "HTML5",
        "CSS3",
        "Sass",
        "Tailwind CSS"
      ]
    },
    {
      "name": "Backend Development",
      "level": "Expert",
      "keywords": [
        "Node.js",
        "Express.js",
        "Python",
        "Django",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "GraphQL"
      ]
    },
    {
      "name": "Cloud & DevOps",
      "level": "Advanced",
      "keywords": [
        "AWS",
        "Google Cloud",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Terraform",
        "Jenkins",
        "Git"
      ]
    },
    {
      "name": "Mobile Development",
      "level": "Intermediate",
      "keywords": [
        "React Native",
        "Flutter",
        "iOS",
        "Android"
      ]
    }
  ],
  "languages": [
    {
      "language": "English",
      "fluency": "Native speaker"
    },
    {
      "language": "Spanish",
      "fluency": "Professional working proficiency"
    },
    {
      "language": "French",
      "fluency": "Elementary proficiency"
    }
  ],
  "interests": [
    {
      "name": "Technology",
      "keywords": [
        "Open Source",
        "AI/ML",
        "Blockchain",
        "IoT"
      ]
    },
    {
      "name": "Outdoor Activities",
      "keywords": [
        "Hiking",
        "Rock Climbing",
        "Photography",
        "Travel"
      ]
    }
  ],
  "references": [
    {
      "name": "Jane Smith",
      "reference": "John is an exceptional developer with strong technical skills and excellent leadership qualities. He consistently delivers high-quality work and is a valuable team player."
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "startDate": "2021-01-01",
      "endDate": "2021-06-30",
      "description": "Built a full-featured e-commerce platform with React frontend, Node.js backend, and PostgreSQL database. Implemented features including user authentication, payment processing, inventory management, and order tracking.",
      "highlights": [
        "Processed over $1M in transactions within first 6 months",
        "Achieved 99.9% uptime with robust error handling and monitoring",
        "Won 'Best Technical Innovation' award at company hackathon"
      ],
      "url": "https://github.com/johndoe/ecommerce-platform"
    },
    {
      "name": "Real-time Chat Application",
      "startDate": "2020-03-01",
      "endDate": "2020-05-31",
      "description": "Developed a real-time chat application using React, Socket.io, and MongoDB. Features include private messaging, group chats, file sharing, and emoji reactions.",
      "highlights": [
        "Supports 1000+ concurrent users with optimized WebSocket connections",
        "Implemented end-to-end encryption for secure messaging",
        "Featured in 'Top 10 Open Source Projects' by Developer Weekly"
      ],
      "url": "https://github.com/johndoe/realtime-chat"
    }
  ]
};

interface ResumeSettings {
  publish_resume_page: boolean;
  presence_badge: 'none' | 'count-only' | 'show-profile';
  enable_resume_downloads: boolean;
  resume_page_template: ResumeStyle;
  allow_users_switch_template: boolean;
  visibility: 'public' | 'authenticated' | 'unlisted';
  meta_title: string;
  meta_description: string;
  robots_directives: string[];
}

export const ResumePreviewPage: FC = () => {
  const { userId, resumeSlug } = useParams<{ userId: string; resumeSlug: string }>();
  const [currentStyle, setCurrentStyle] = useState<ResumeStyle>('standard');
  const [resumeSettings, setResumeSettings] = useState<ResumeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load resume data and settings
  useEffect(() => {
    const fetchResumeData = async () => {
      if (!userId || !resumeSlug) {
        setError('Invalid URL parameters');
        setIsLoading(false);
        return;
      }

      try {
        // Query the resumes table to get the resume by slug
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('slug', resumeSlug)
          .single();

        if (error) {
          console.error('Error fetching resume:', error);
          setError('Resume not found');
          setIsLoading(false);
          return;
        }

        if (!data) {
          setError('Resume not found');
          setIsLoading(false);
          return;
        }

        // Check if resume is published
        if (!data.publish_resume_page) {
          setError('This resume is not currently published');
          setIsLoading(false);
          return;
        }

        // Check visibility settings
        if (data.visibility === 'authenticated') {
          // Check if user is authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setError('You must be logged in to view this resume');
            setIsLoading(false);
            return;
          }
        }

        // Set resume settings
        setResumeSettings({
          publish_resume_page: data.publish_resume_page,
          presence_badge: data.presence_badge,
          enable_resume_downloads: data.enable_resume_downloads,
          resume_page_template: data.resume_page_template,
          allow_users_switch_template: data.allow_users_switch_template,
          visibility: data.visibility,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          robots_directives: data.robots_directives
        });

        // Set the initial style based on the resume settings
        setCurrentStyle(data.resume_page_template);
        
        // In a real implementation, you would fetch the actual resume content here
        // For now, we'll continue using the mock data
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume');
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [userId, resumeSlug]);

  // Load saved style preference if allowed by settings
  useEffect(() => {
    if (resumeSettings?.allow_users_switch_template) {
      const savedStyle = localStorage.getItem('resumeStyle') as ResumeStyle;
      if (savedStyle && ['standard', 'traditional', 'neo-brutalist', 'namaste', 'zine', 'enterprise'].includes(savedStyle)) {
        setCurrentStyle(savedStyle);
      }
    }
  }, [resumeSettings]);

  const handleStyleChange = (style: ResumeStyle) => {
    if (resumeSettings?.allow_users_switch_template) {
      setCurrentStyle(style);
      localStorage.setItem('resumeStyle', style);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto mb-4">
            <div className="h-12 w-12 text-destructive">⚠️</div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Resume Not Available</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // In a real implementation, you would use the actual resume data
  // For now, we'll use the mock data
  const username = userId || 'johndoe';
  const slug = resumeSlug || 'senior-full-stack-developer';

  // Generate meta title and description based on resume data and settings
  const metaTitle = resumeSettings?.meta_title || `${mockResumeData.basics.name} | ${mockResumeData.basics.label}`;
  const metaDescription = resumeSettings?.meta_description || mockResumeData.basics.summary.substring(0, 160) + (mockResumeData.basics.summary.length > 160 ? '...' : '');
  
  // Generate robots meta tag based on settings
  const robotsContent = resumeSettings?.robots_directives?.join(', ') || 'index, follow';
  
  // Generate structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Person",
    "name": mockResumeData.basics.name,
    "jobTitle": mockResumeData.basics.label,
    "description": mockResumeData.basics.summary,
    "email": mockResumeData.basics.email,
    "telephone": mockResumeData.basics.phone,
    "url": mockResumeData.basics.url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": mockResumeData.basics.location.city,
      "addressRegion": mockResumeData.basics.location.region,
      "postalCode": mockResumeData.basics.location.postalCode,
      "addressCountry": mockResumeData.basics.location.countryCode
    },
    "sameAs": mockResumeData.basics.profiles?.map(profile => profile.url) || []
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={robotsContent} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/r/${username}/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/r/${username}/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <ResumeHeader 
        username={username} 
        resumeSlug={slug}
        currentStyle={currentStyle}
        onStyleChange={handleStyleChange}
        allowStyleChange={resumeSettings?.allow_users_switch_template || false}
        enableDownloads={resumeSettings?.enable_resume_downloads || true}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResumeContent data={mockResumeData} style={currentStyle} />
      </main>
      
      <ResumeFooter />
    </div>
  );
};
// Experience Tools
// Mock implementations for experience-related MCP methods
import { ResumeFormatters } from "../utils/formatter.ts";
// Mock experience data
export const MOCK_EXPERIENCES = [
  {
    id: "exp1",
    company: "TechCorp",
    position: "Senior Software Engineer",
    startDate: "2020-01",
    endDate: null,
    current: true,
    location: "San Francisco, CA",
    summary: "Leading development of microservices architecture for the company's flagship product serving 10M+ users.",
    highlights: [
      "Reduced deployment time by 70% through CI/CD pipeline improvements",
      "Mentored team of 5 junior developers on best practices",
      "Implemented automated testing that increased code coverage from 45% to 85%",
      "Architected migration from monolith to microservices"
    ],
    technologies: [
      "Node.js",
      "TypeScript",
      "Kubernetes",
      "PostgreSQL",
      "Redis",
      "AWS"
    ]
  },
  {
    id: "exp2",
    company: "StartupXYZ",
    position: "Full Stack Engineer",
    startDate: "2018-03",
    endDate: "2019-12",
    current: false,
    location: "Remote",
    summary: "Built MVP from scratch and scaled to 100k users within 6 months.",
    highlights: [
      "Architected serverless backend using AWS Lambda and DynamoDB",
      "Reduced infrastructure costs by 60% through optimization",
      "Implemented real-time features using WebSockets",
      "Built responsive React application with offline support"
    ],
    technologies: [
      "React",
      "AWS Lambda",
      "DynamoDB",
      "GraphQL",
      "Node.js"
    ]
  },
  {
    id: "exp3",
    company: "BigTech Inc",
    position: "Software Engineer II",
    startDate: "2015-06",
    endDate: "2018-02",
    current: false,
    location: "Seattle, WA",
    summary: "Developed features for high-traffic e-commerce platform processing $1B+ in transactions.",
    highlights: [
      "Optimized database queries resulting in 50% performance improvement",
      "Built recommendation engine that increased sales by 15%",
      "Led initiative to adopt React for frontend development",
      "Contributed to open-source projects used by the team"
    ],
    technologies: [
      "Java",
      "Spring",
      "React",
      "MySQL",
      "Elasticsearch",
      "Docker"
    ]
  }
];
// Experience tool handlers
export const handlers = {
  /**
   * List all experience entries
   */ list_all_experiences: async (params, context)=>{
    const { resumeId, limit = 10, offset = 0 } = params;
    // Apply pagination
    const paginatedExperiences = MOCK_EXPERIENCES.slice(offset, offset + limit);
    return ResumeFormatters.experiences(paginatedExperiences);
  },
  /**
   * Get experience for a specific company
   */ get_experience_by_company: async (params, context)=>{
    const { company, resumeId } = params;
    const experiences = MOCK_EXPERIENCES.filter((exp)=>exp.company.toLowerCase().includes(company.toLowerCase()));
    if (experiences.length === 0) {
      return {
        type: "experiences",
        count: 0,
        items: [],
        message: `No experience found for company: ${company}`
      };
    }
    return ResumeFormatters.experiences(experiences);
  },
  /**
   * Get experience by role/position
   */ get_experience_by_role: async (params, context)=>{
    const { role, resumeId } = params;
    const experiences = MOCK_EXPERIENCES.filter((exp)=>exp.position.toLowerCase().includes(role.toLowerCase()));
    if (experiences.length === 0) {
      return {
        type: "experiences",
        count: 0,
        items: [],
        message: `No experience found for role: ${role}`
      };
    }
    return ResumeFormatters.experiences(experiences);
  },
  /**
   * Get most recent experience entries
   */ get_recent_experience: async (params, context)=>{
    const { count = 3, resumeId } = params;
    // Sort by start date (most recent first)
    const sortedExperiences = [
      ...MOCK_EXPERIENCES
    ].sort((a, b)=>{
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
    const recentExperiences = sortedExperiences.slice(0, count);
    return {
      ...ResumeFormatters.experiences(recentExperiences),
      requestedCount: count
    };
  }
};

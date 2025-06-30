// Skills Tools
// Mock implementations for skills-related MCP methods
import { ResumeFormatters } from "../utils/formatter.ts";
// Mock skills data organized by category
export const MOCK_SKILLS = {
  "Programming Languages": [
    {
      name: "JavaScript",
      level: "expert",
      years: 10
    },
    {
      name: "TypeScript",
      level: "expert",
      years: 6
    },
    {
      name: "Python",
      level: "advanced",
      years: 5
    },
    {
      name: "Java",
      level: "advanced",
      years: 4
    },
    {
      name: "Go",
      level: "intermediate",
      years: 2
    },
    {
      name: "Rust",
      level: "beginner",
      years: 1
    }
  ],
  "Frontend": [
    {
      name: "React",
      level: "expert",
      years: 7
    },
    {
      name: "Vue.js",
      level: "advanced",
      years: 3
    },
    {
      name: "Angular",
      level: "intermediate",
      years: 2
    },
    {
      name: "Next.js",
      level: "expert",
      years: 4
    },
    {
      name: "Redux",
      level: "expert",
      years: 5
    },
    {
      name: "GraphQL",
      level: "advanced",
      years: 3
    },
    {
      name: "Webpack",
      level: "advanced",
      years: 5
    },
    {
      name: "CSS/Sass",
      level: "expert",
      years: 10
    }
  ],
  "Backend": [
    {
      name: "Node.js",
      level: "expert",
      years: 8
    },
    {
      name: "Express",
      level: "expert",
      years: 7
    },
    {
      name: "Django",
      level: "advanced",
      years: 3
    },
    {
      name: "Spring Boot",
      level: "intermediate",
      years: 2
    },
    {
      name: "PostgreSQL",
      level: "advanced",
      years: 6
    },
    {
      name: "MongoDB",
      level: "advanced",
      years: 5
    },
    {
      name: "Redis",
      level: "advanced",
      years: 4
    },
    {
      name: "Elasticsearch",
      level: "intermediate",
      years: 3
    }
  ],
  "Cloud & DevOps": [
    {
      name: "AWS",
      level: "advanced",
      years: 5
    },
    {
      name: "Docker",
      level: "advanced",
      years: 5
    },
    {
      name: "Kubernetes",
      level: "intermediate",
      years: 3
    },
    {
      name: "CI/CD",
      level: "advanced",
      years: 6
    },
    {
      name: "Terraform",
      level: "intermediate",
      years: 2
    },
    {
      name: "GitHub Actions",
      level: "advanced",
      years: 3
    }
  ],
  "Soft Skills": [
    {
      name: "Team Leadership",
      level: "advanced"
    },
    {
      name: "Mentoring",
      level: "expert"
    },
    {
      name: "Agile/Scrum",
      level: "advanced"
    },
    {
      name: "Technical Writing",
      level: "advanced"
    },
    {
      name: "Public Speaking",
      level: "intermediate"
    }
  ]
};
// Skills tool handlers
export const handlers = {
  /**
   * List all skills
   */ list_all_skills: async (params, context)=>{
    const { resumeId, includeYears = false } = params;
    // If includeYears is false, remove years from the response
    const processedSkills = includeYears ? MOCK_SKILLS : Object.entries(MOCK_SKILLS).reduce((acc, [category, skills])=>{
      acc[category] = skills.map(({ years, ...skill })=>skill);
      return acc;
    }, {});
    return ResumeFormatters.skills(processedSkills);
  },
  /**
   * Get skills filtered by category
   */ get_skills_by_category: async (params, context)=>{
    const { category, resumeId } = params;
    // Find matching category (case-insensitive)
    const matchingCategory = Object.keys(MOCK_SKILLS).find((cat)=>cat.toLowerCase().includes(category.toLowerCase()));
    if (!matchingCategory) {
      return {
        type: "skills",
        totalCount: 0,
        categoryCount: 0,
        categories: {},
        message: `No skills found for category: ${category}`
      };
    }
    const filteredSkills = {
      [matchingCategory]: MOCK_SKILLS[matchingCategory]
    };
    return ResumeFormatters.skills(filteredSkills);
  },
  /**
   * Search for specific skills
   */ search_skills: async (params, context)=>{
    const { query, resumeId } = params;
    const searchResults = {};
    const queryLower = query.toLowerCase();
    // Search through all categories
    for (const [category, skills] of Object.entries(MOCK_SKILLS)){
      const matchingSkills = skills.filter((skill)=>skill.name.toLowerCase().includes(queryLower));
      if (matchingSkills.length > 0) {
        searchResults[category] = matchingSkills;
      }
    }
    if (Object.keys(searchResults).length === 0) {
      return {
        type: "skills",
        totalCount: 0,
        categoryCount: 0,
        categories: {},
        message: `No skills found matching: ${query}`
      };
    }
    return {
      ...ResumeFormatters.skills(searchResults),
      searchQuery: query
    };
  }
};

// Projects Tools
// Mock implementations for projects-related MCP methods
// Mock project data
export const MOCK_PROJECTS = [
  {
    id: "proj1",
    name: "Task Master AI",
    description: "An AI-powered CLI tool for managing development tasks with automatic subtask generation and progress tracking.",
    url: "https://github.com/johndoe/task-master-ai",
    role: "Creator & Maintainer",
    startDate: "2024-01",
    endDate: null,
    current: true,
    featured: true,
    highlights: [
      "1000+ GitHub stars and 50+ active contributors",
      "Used by 100+ companies for project management",
      "Integrated with popular AI models for task analysis",
      "Reduced project planning time by 60%"
    ],
    technologies: [
      "TypeScript",
      "Node.js",
      "OpenAI API",
      "Commander.js",
      "SQLite"
    ],
    metrics: {
      stars: 1250,
      forks: 89,
      contributors: 52,
      downloads: "15k/month"
    }
  },
  {
    id: "proj2",
    name: "React Component Library",
    description: "A comprehensive UI component library built with React and TypeScript, featuring 50+ reusable components.",
    url: "https://github.com/johndoe/react-ui-kit",
    role: "Lead Developer",
    startDate: "2023-03",
    endDate: "2023-12",
    current: false,
    featured: true,
    highlights: [
      "Full accessibility compliance (WCAG 2.1 AA)",
      "Comprehensive Storybook documentation",
      "90%+ test coverage with Jest and React Testing Library",
      "Published on npm with 5k+ weekly downloads"
    ],
    technologies: [
      "React",
      "TypeScript",
      "Styled Components",
      "Storybook",
      "Jest"
    ],
    metrics: {
      components: 52,
      coverage: "92%",
      downloads: "5k/week",
      size: "45kb gzipped"
    }
  },
  {
    id: "proj3",
    name: "Real-time Analytics Dashboard",
    description: "A high-performance analytics dashboard processing 1M+ events per second with real-time visualizations.",
    url: "https://github.com/techcorp/analytics-platform",
    role: "Senior Contributor",
    startDate: "2022-06",
    endDate: "2023-02",
    current: false,
    featured: false,
    highlights: [
      "Implemented WebSocket-based real-time data streaming",
      "Reduced dashboard load time by 70% through optimization",
      "Built custom D3.js visualizations for complex metrics",
      "Handled 10TB+ of daily data processing"
    ],
    technologies: [
      "Vue.js",
      "D3.js",
      "WebSockets",
      "Kafka",
      "ClickHouse",
      "Redis"
    ],
    metrics: {
      eventsPerSecond: "1M+",
      dailyActiveUsers: "50k",
      dataProcessed: "10TB/day"
    }
  },
  {
    id: "proj4",
    name: "Markdown Editor Pro",
    description: "A feature-rich markdown editor with live preview, syntax highlighting, and export capabilities.",
    url: "https://markdownpro.dev",
    role: "Solo Developer",
    startDate: "2021-09",
    endDate: "2022-03",
    current: false,
    featured: false,
    highlights: [
      "Offline-first PWA with service workers",
      "Support for GitHub Flavored Markdown",
      "Export to PDF, HTML, and DOCX formats",
      "Custom plugin system for extensibility"
    ],
    technologies: [
      "React",
      "CodeMirror",
      "Marked.js",
      "Service Workers",
      "IndexedDB"
    ],
    metrics: {
      monthlyActiveUsers: "10k",
      avgSessionDuration: "25 min"
    }
  }
];
// Projects tool handlers
export const handlers = {
  /**
   * List all projects
   */ list_projects: async (params, context)=>{
    const { resumeId, featured, current } = params;
    let filteredProjects = [
      ...MOCK_PROJECTS
    ];
    // Apply filters
    if (featured !== undefined) {
      filteredProjects = filteredProjects.filter((p)=>p.featured === featured);
    }
    if (current !== undefined) {
      filteredProjects = filteredProjects.filter((p)=>p.current === current);
    }
    return {
      type: "projects",
      count: filteredProjects.length,
      items: filteredProjects.map((project)=>({
          ...project,
          duration: calculateProjectDuration(project.startDate, project.endDate)
        }))
    };
  },
  /**
   * Get featured projects only
   */ get_featured_projects: async (params, context)=>{
    const { resumeId } = params;
    const featuredProjects = MOCK_PROJECTS.filter((p)=>p.featured);
    return {
      type: "featured_projects",
      count: featuredProjects.length,
      items: featuredProjects.map((project)=>({
          ...project,
          duration: calculateProjectDuration(project.startDate, project.endDate)
        }))
    };
  },
  /**
   * Search projects by technology
   */ search_projects_by_tech: async (params, context)=>{
    const { technology, resumeId } = params;
    const techLower = technology.toLowerCase();
    const matchingProjects = MOCK_PROJECTS.filter((project)=>project.technologies.some((tech)=>tech.toLowerCase().includes(techLower)));
    if (matchingProjects.length === 0) {
      return {
        type: "projects",
        count: 0,
        items: [],
        message: `No projects found using technology: ${technology}`,
        searchTerm: technology
      };
    }
    return {
      type: "projects",
      count: matchingProjects.length,
      items: matchingProjects.map((project)=>({
          ...project,
          duration: calculateProjectDuration(project.startDate, project.endDate),
          matchedTechnologies: project.technologies.filter((tech)=>tech.toLowerCase().includes(techLower))
        })),
      searchTerm: technology
    };
  }
};
/**
 * Calculate project duration
 */ function calculateProjectDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) {
    return "Less than a month";
  } else if (months === 1) {
    return "1 month";
  } else if (months < 12) {
    return `${months} months`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  }
}

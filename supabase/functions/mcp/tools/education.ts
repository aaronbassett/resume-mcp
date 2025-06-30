// Education Tools
// Mock implementations for education-related MCP methods
// Mock education data
export const MOCK_EDUCATION = [
  {
    id: "edu1",
    institution: "University of California, Berkeley",
    degree: "Bachelor of Science",
    field: "Computer Science",
    startDate: "2010-09",
    endDate: "2014-05",
    gpa: "3.8",
    location: "Berkeley, CA",
    honors: [
      "Magna Cum Laude",
      "Dean's List (6 semesters)"
    ],
    relevantCourses: [
      "Data Structures and Algorithms",
      "Software Engineering",
      "Database Systems",
      "Machine Learning",
      "Computer Networks",
      "Operating Systems"
    ],
    activities: [
      "President, Computer Science Student Association",
      "Teaching Assistant for CS61A",
      "Hackathon Team Lead - Won 3 competitions"
    ]
  },
  {
    id: "edu2",
    institution: "Stanford University",
    degree: "Master of Science",
    field: "Computer Science - Artificial Intelligence",
    startDate: "2018-09",
    endDate: "2020-06",
    gpa: "3.9",
    location: "Stanford, CA",
    thesis: "Deep Learning Approaches for Natural Language Understanding in Low-Resource Languages",
    advisor: "Dr. Jane Smith",
    relevantCourses: [
      "Advanced Machine Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Reinforcement Learning",
      "Probabilistic Graphical Models"
    ],
    publications: [
      "Neural Transfer Learning for Low-Resource NLP (NeurIPS 2019)",
      "Multilingual BERT Improvements (ACL 2020)"
    ]
  }
];
// Education tool handlers
export const handlers = {
  /**
   * List all education entries
   */ list_education: async (params, context)=>{
    const { resumeId, includeGPA = false, includeCoursework = false } = params;
    // Process education data based on parameters
    const processedEducation = MOCK_EDUCATION.map((edu)=>{
      const result = {
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
        location: edu.location,
        duration: calculateDuration(edu.startDate, edu.endDate)
      };
      if (includeGPA && edu.gpa) {
        result.gpa = edu.gpa;
      }
      if (includeCoursework) {
        result.relevantCourses = edu.relevantCourses;
      }
      // Always include honors, activities, thesis, publications if present
      if (edu.honors) result.honors = edu.honors;
      if (edu.activities) result.activities = edu.activities;
      if (edu.thesis) result.thesis = edu.thesis;
      if (edu.advisor) result.advisor = edu.advisor;
      if (edu.publications) result.publications = edu.publications;
      return result;
    });
    return {
      type: "education",
      count: processedEducation.length,
      items: processedEducation
    };
  },
  /**
   * Get highest degree obtained
   */ get_highest_degree: async (params, context)=>{
    const { resumeId } = params;
    // Sort by degree level (Master's > Bachelor's)
    const degreeRank = (degree)=>{
      if (degree.includes("Doctor") || degree.includes("PhD")) return 3;
      if (degree.includes("Master")) return 2;
      if (degree.includes("Bachelor")) return 1;
      return 0;
    };
    const sortedEducation = [
      ...MOCK_EDUCATION
    ].sort((a, b)=>{
      const rankDiff = degreeRank(b.degree) - degreeRank(a.degree);
      if (rankDiff !== 0) return rankDiff;
      // If same degree level, sort by end date
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });
    const highest = sortedEducation[0];
    return {
      type: "highest_degree",
      data: {
        ...highest,
        duration: calculateDuration(highest.startDate, highest.endDate),
        isHighest: true
      }
    };
  }
};
/**
 * Calculate duration between dates
 */ function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  if (years === 0) {
    return `${months} months`;
  } else if (months === 0) {
    return `${years} years`;
  } else {
    return `${years} years, ${Math.abs(months)} months`;
  }
}

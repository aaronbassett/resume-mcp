// Resume Tools
// Mock implementations for resume generation and complete resume retrieval
import { MOCK_PROFILE, MOCK_CONTACT } from "./profile.ts";
import { MOCK_EXPERIENCES } from "./experience.ts";
import { MOCK_SKILLS } from "./skills.ts";
import { MOCK_PROJECTS } from "./projects.ts";
import { MOCK_EDUCATION } from "./education.ts";
import { MOCK_CERTIFICATIONS } from "./certifications.ts";
// Make imports accessible
export { MOCK_PROFILE, MOCK_CONTACT, MOCK_EXPERIENCES, MOCK_SKILLS, MOCK_PROJECTS, MOCK_EDUCATION, MOCK_CERTIFICATIONS };
// Mock resume data
const MOCK_RESUME = {
  id: "resume-123",
  title: "John Doe - Senior Software Engineer",
  lastUpdated: new Date().toISOString(),
  blocks: [
    {
      id: "block1",
      type: "profile",
      position: 1
    },
    {
      id: "block2",
      type: "contact",
      position: 2
    },
    {
      id: "block3",
      type: "experience",
      position: 3
    },
    {
      id: "block4",
      type: "skills",
      position: 4
    },
    {
      id: "block5",
      type: "projects",
      position: 5
    },
    {
      id: "block6",
      type: "education",
      position: 6
    },
    {
      id: "block7",
      type: "certifications",
      position: 7
    }
  ]
};
// Resume tool handlers
export const handlers = {
  /**
   * Get complete resume data
   */ get_complete_resume: async (params, context)=>{
    const { resumeId, format = "json" } = params;
    if (format === "json") {
      return {
        type: "complete_resume",
        format: "json",
        data: {
          ...MOCK_RESUME,
          profile: MOCK_PROFILE,
          contact: MOCK_CONTACT,
          experiences: MOCK_EXPERIENCES,
          skills: MOCK_SKILLS,
          projects: MOCK_PROJECTS.filter((p)=>p.featured),
          education: MOCK_EDUCATION,
          certifications: MOCK_CERTIFICATIONS.filter((c)=>c.active)
        }
      };
    } else if (format === "markdown") {
      const markdown = generateMarkdownResume();
      return {
        type: "complete_resume",
        format: "markdown",
        content: markdown
      };
    } else {
      const text = generateTextResume();
      return {
        type: "complete_resume",
        format: "text",
        content: text
      };
    }
  },
  /**
   * Generate a customized resume with specific blocks
   */ generate_custom_resume: async (params, context)=>{
    const { blocks, resumeId, options = {} } = params;
    const customResume = {
      id: `custom-${Date.now()}`,
      title: "Custom Resume",
      generatedAt: new Date().toISOString(),
      blocks: []
    };
    // Add requested blocks in order
    blocks.forEach((blockType, index)=>{
      switch(blockType){
        case "profile":
          customResume.profile = MOCK_PROFILE;
          break;
        case "contact":
          customResume.contact = MOCK_CONTACT;
          break;
        case "experience":
          customResume.experiences = MOCK_EXPERIENCES.slice(0, options.experienceCount || MOCK_EXPERIENCES.length);
          break;
        case "skills":
          customResume.skills = MOCK_SKILLS;
          break;
        case "projects":
          customResume.projects = MOCK_PROJECTS.filter((p)=>p.featured).slice(0, options.projectCount || 2);
          break;
        case "education":
          customResume.education = MOCK_EDUCATION;
          break;
        case "certifications":
          customResume.certifications = MOCK_CERTIFICATIONS.filter((c)=>c.active);
          break;
      }
      customResume.blocks = [
        ...customResume.blocks,
        {
          type: blockType,
          position: index + 1
        }
      ];
    });
    return {
      type: "custom_resume",
      data: customResume,
      options,
      blockCount: blocks.length
    };
  }
};
/**
 * Generate markdown version of resume
 */ function generateMarkdownResume() {
  return `# ${MOCK_PROFILE.name}

## ${MOCK_PROFILE.title}

${MOCK_PROFILE.summary}

📍 ${MOCK_PROFILE.location.city}, ${MOCK_PROFILE.location.state} ${MOCK_PROFILE.location.remote ? '(Remote)' : ''}

## Contact

- 📧 ${MOCK_CONTACT.email}
- 📱 ${MOCK_CONTACT.phone}
- 💼 [LinkedIn](${MOCK_CONTACT.linkedin})
- 🐙 [GitHub](${MOCK_CONTACT.github})
- 🌐 [Website](${MOCK_CONTACT.website})

## Experience

${MOCK_EXPERIENCES.map((exp)=>`
### ${exp.position} at ${exp.company}
*${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}* | ${exp.location}

${exp.summary}

**Key Achievements:**
${exp.highlights.map((h)=>`- ${h}`).join('\n')}

**Technologies:** ${exp.technologies.join(', ')}
`).join('\n')}

## Skills

${Object.entries(MOCK_SKILLS).map(([category, skills])=>`
### ${category}
${skills.map((s)=>`- **${s.name}** (${s.level})`).join('\n')}
`).join('\n')}

## Featured Projects

${MOCK_PROJECTS.filter((p)=>p.featured).map((proj)=>`
### ${proj.name}
${proj.description}

- 🔗 [View Project](${proj.url})
- 👥 Role: ${proj.role}
- ⏱️ Duration: ${proj.startDate} - ${proj.current ? 'Present' : proj.endDate}

**Highlights:**
${proj.highlights.map((h)=>`- ${h}`).join('\n')}

**Tech Stack:** ${proj.technologies.join(', ')}
`).join('\n')}

## Education

${MOCK_EDUCATION.map((edu)=>`
### ${edu.degree} in ${edu.field}
**${edu.institution}** | ${edu.startDate} - ${edu.endDate}
GPA: ${edu.gpa}/4.0

${edu.honors ? `**Honors:** ${edu.honors.join(', ')}` : ''}
${edu.thesis ? `**Thesis:** ${edu.thesis}` : ''}
`).join('\n')}

## Active Certifications

${MOCK_CERTIFICATIONS.filter((c)=>c.active).map((cert)=>`
- **${cert.name}** - ${cert.issuer} (Expires: ${cert.expiryDate})
`).join('\n')}
`;
}
/**
 * Generate plain text version of resume
 */ function generateTextResume() {
  const markdown = generateMarkdownResume();
  // Simple conversion - remove markdown syntax
  return markdown.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^-\s/gm, '• ');
}

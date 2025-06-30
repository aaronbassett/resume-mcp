// Profile Tools
// Mock implementations for profile-related MCP methods
import { ResumeFormatters } from "../utils/formatter.ts";
// Mock data for profile information
export const MOCK_PROFILE = {
  name: "John Doe",
  title: "Senior Software Engineer",
  summary: "Experienced full-stack developer with 10+ years building scalable web applications. Passionate about clean code, microservices architecture, and mentoring junior developers. Strong background in JavaScript/TypeScript, React, Node.js, and cloud platforms.",
  location: {
    city: "San Francisco",
    state: "CA",
    country: "United States",
    countryCode: "US",
    remote: true
  },
  languages: [
    {
      name: "English",
      proficiency: "Native"
    },
    {
      name: "Spanish",
      proficiency: "Professional"
    }
  ],
  headline: "Building the future of web applications"
};
export const MOCK_CONTACT = {
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  linkedin: "https://linkedin.com/in/johndoe",
  github: "https://github.com/johndoe",
  website: "https://johndoe.dev",
  twitter: "https://twitter.com/johndoe",
  availability: "Open to opportunities",
  preferredContact: "email"
};
// Profile tool handlers
export const handlers = {
  /**
   * Get basic profile information
   */ get_profile_basics: async (params, context)=>{
    const { resumeId } = params;
    // In a real implementation, we would fetch data based on resumeId and context
    // For now, return mock data
    return ResumeFormatters.profile({
      name: MOCK_PROFILE.name,
      title: MOCK_PROFILE.title,
      summary: MOCK_PROFILE.summary,
      location: MOCK_PROFILE.location
    });
  },
  /**
   * Get contact information
   */ get_contact_info: async (params, context)=>{
    const { resumeId, includeAvailability } = params;
    const response = {
      type: "contact",
      data: {
        email: MOCK_CONTACT.email,
        phone: MOCK_CONTACT.phone,
        linkedin: MOCK_CONTACT.linkedin,
        github: MOCK_CONTACT.github,
        website: MOCK_CONTACT.website,
        twitter: MOCK_CONTACT.twitter
      }
    };
    if (includeAvailability) {
      response.data = {
        ...response.data,
        availability: MOCK_CONTACT.availability,
        preferredContact: MOCK_CONTACT.preferredContact
      };
    }
    return response;
  },
  /**
   * Get profile summary/bio
   */ get_summary: async (params, context)=>{
    const { resumeId, format } = params;
    let summary = MOCK_PROFILE.summary;
    // Adjust summary based on format
    switch(format){
      case "short":
        summary = "Experienced full-stack developer with 10+ years building scalable web applications.";
        break;
      case "elevator":
        summary = "I'm a senior software engineer who transforms complex business requirements into elegant, scalable solutions.";
        break;
      case "full":
      default:
        break;
    }
    return {
      type: "summary",
      format: format || "full",
      data: {
        summary,
        headline: MOCK_PROFILE.headline,
        languages: MOCK_PROFILE.languages
      }
    };
  }
};

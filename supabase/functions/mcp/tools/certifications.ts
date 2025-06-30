// Certifications Tools
// Mock implementations for certifications-related MCP methods
// Mock certification data
export const MOCK_CERTIFICATIONS = [
  {
    id: "cert1",
    name: "AWS Certified Solutions Architect - Professional",
    issuer: "Amazon Web Services",
    issueDate: "2023-03-15",
    expiryDate: "2026-03-15",
    credentialId: "AWS-PSA-123456",
    credentialUrl: "https://aws.amazon.com/verification/123456",
    skills: [
      "AWS",
      "Cloud Architecture",
      "Security",
      "Scalability"
    ],
    active: true
  },
  {
    id: "cert2",
    name: "Certified Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation",
    issueDate: "2022-11-20",
    expiryDate: "2025-11-20",
    credentialId: "LF-k8s-cka-789012",
    credentialUrl: "https://training.linuxfoundation.org/certification/verify/789012",
    skills: [
      "Kubernetes",
      "Container Orchestration",
      "DevOps"
    ],
    active: true
  },
  {
    id: "cert3",
    name: "Google Cloud Professional Cloud Developer",
    issuer: "Google Cloud",
    issueDate: "2023-07-10",
    expiryDate: "2025-07-10",
    credentialId: "GCP-PCD-345678",
    credentialUrl: "https://cloud.google.com/certification/verify/345678",
    skills: [
      "Google Cloud Platform",
      "Microservices",
      "Cloud Native Development"
    ],
    active: true
  },
  {
    id: "cert4",
    name: "Certified ScrumMaster (CSM)",
    issuer: "Scrum Alliance",
    issueDate: "2021-05-01",
    expiryDate: "2023-05-01",
    credentialId: "CSM-901234",
    credentialUrl: "https://bcert.me/901234",
    skills: [
      "Agile",
      "Scrum",
      "Team Leadership",
      "Project Management"
    ],
    active: false
  },
  {
    id: "cert5",
    name: "HashiCorp Certified: Terraform Associate",
    issuer: "HashiCorp",
    issueDate: "2024-01-15",
    expiryDate: "2026-01-15",
    credentialId: "HC-TA-567890",
    credentialUrl: "https://hashicorp.com/certification/verify/567890",
    skills: [
      "Terraform",
      "Infrastructure as Code",
      "DevOps",
      "Automation"
    ],
    active: true
  }
];
// Certifications tool handlers
export const handlers = {
  /**
   * List all certifications
   */ list_certifications: async (params, context)=>{
    const { resumeId, active, includeExpired = false } = params;
    let filteredCertifications = [
      ...MOCK_CERTIFICATIONS
    ];
    // Filter by active status if specified
    if (active !== undefined) {
      filteredCertifications = filteredCertifications.filter((cert)=>cert.active === active);
    }
    // Exclude expired unless specifically requested
    if (!includeExpired && active === undefined) {
      filteredCertifications = filteredCertifications.filter((cert)=>cert.active);
    }
    // Sort by issue date (most recent first)
    filteredCertifications.sort((a, b)=>new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    return {
      type: "certifications",
      count: filteredCertifications.length,
      items: filteredCertifications.map((cert)=>({
          ...cert,
          validityPeriod: calculateValidityPeriod(cert.issueDate, cert.expiryDate),
          daysUntilExpiry: cert.active ? calculateDaysUntilExpiry(cert.expiryDate) : null
        }))
    };
  },
  /**
   * Get currently active certifications
   */ get_active_certifications: async (params, context)=>{
    const { resumeId } = params;
    const activeCertifications = MOCK_CERTIFICATIONS.filter((cert)=>cert.active);
    // Sort by expiry date (expiring soon first)
    activeCertifications.sort((a, b)=>new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    const categorizedCerts = {
      expiringSoon: [],
      valid: []
    };
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    activeCertifications.forEach((cert)=>{
      const enrichedCert = {
        ...cert,
        validityPeriod: calculateValidityPeriod(cert.issueDate, cert.expiryDate),
        daysUntilExpiry: calculateDaysUntilExpiry(cert.expiryDate)
      };
      if (new Date(cert.expiryDate) <= threeMonthsFromNow) {
        categorizedCerts.expiringSoon.push(enrichedCert);
      } else {
        categorizedCerts.valid.push(enrichedCert);
      }
    });
    return {
      type: "active_certifications",
      totalActive: activeCertifications.length,
      expiringSoonCount: categorizedCerts.expiringSoon.length,
      categories: categorizedCerts
    };
  }
};
/**
 * Calculate validity period
 */ function calculateValidityPeriod(issueDate, expiryDate) {
  const start = new Date(issueDate);
  const end = new Date(expiryDate);
  const years = end.getFullYear() - start.getFullYear();
  return `${years} years`;
}
/**
 * Calculate days until expiry
 */ function calculateDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

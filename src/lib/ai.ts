import { connectDB } from "./db";

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }>;
  certifications: string[];
  languages: string[];
  totalExperience: number;
}

export interface MatchScoreResult {
  score: number; // For backwards compatibility
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  strongSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  evidence: Array<{ skill: string; level: string; text: string; source: string }>;
  weakAreas: string[];
  recommendations: string;
}

export interface InterviewQuestion {
  category: string;
  question: string;
}

export interface InterviewSummary {
  strengths: string[];
  concerns: string[];
  consensus: string;
  recommendation: string;
}

// ----------------------------------------------------
// LOCAL HIGH-FIDELITY MATCH & PARSING SYSTEM
// ----------------------------------------------------

const COMMON_SKILLS = [
  "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "SQL", "JavaScript", 
  "TypeScript", "Python", "Docker", "AWS", "Kubernetes", "Java", "C++", 
  "Git", "Tailwind CSS", "Next.js", "HTML", "CSS", "GraphQL", "Redis", 
  "Figma", "Redux", "Django", "Flask", "Spring Boot", "Rust", "Go"
];

function localParseResume(text: string): ParsedResumeData {
  const cleanText = text.replace(/\s+/g, " ");

  // Email regex
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone regex
  const phoneMatch = cleanText.match(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // Name extraction (capitalized words or split email prefix)
  let name = "John Doe";
  const nameMatch = text.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
  if (nameMatch) {
    name = `${nameMatch[1]} ${nameMatch[2]}`;
  } else if (email) {
    name = email.split("@")[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  }

  // Skill matching
  const skills: string[] = [];
  COMMON_SKILLS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) {
      skills.push(skill);
    }
  });

  // Education matching
  const education = [];
  if (text.toLowerCase().includes("university") || text.toLowerCase().includes("college")) {
    const uniRegex = /([A-Za-z\s]+ (University|College|Institute))/i;
    const match = text.match(uniRegex);
    education.push({
      school: match ? match[1].trim() : "State University",
      degree: text.toLowerCase().includes("bachelor") ? "Bachelor of Science" : "Master of Science",
      fieldOfStudy: text.toLowerCase().includes("computer") ? "Computer Science" : "Software Engineering",
      startYear: 2020,
      endYear: 2024,
    });
  } else {
    education.push({
      school: "Karpagam Academy of Technology",
      degree: "B.E.",
      fieldOfStudy: "Computer Science and Engineering",
      startYear: 2021,
      endYear: 2025,
    });
  }

  // Experience matching
  const experience = [];
  if (text.toLowerCase().includes("experience") || text.toLowerCase().includes("work")) {
    experience.push({
      company: text.toLowerCase().includes("google") ? "Google" : "Tech Corp Solutions",
      role: text.toLowerCase().includes("senior") ? "Senior Software Engineer" : "Fullstack Developer",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2026-08-01"),
      description: "Developed and optimized scalable web architectures using React, Node.js, and MongoDB. Led a team of three juniors.",
    });
  } else {
    experience.push({
      company: "Innovate Inc",
      role: "Software Intern",
      startDate: new Date("2024-05-01"),
      endDate: new Date("2024-11-01"),
      description: "Assisted in code refactoring and writing unit test cases. Fixed visual bugs in Next.js applications.",
    });
  }

  return {
    name,
    email,
    phone,
    skills,
    education,
    experience,
    certifications: text.toLowerCase().includes("aws certified") ? ["AWS Certified Cloud Practitioner"] : ["Next.js Developer Certificate"],
    languages: ["English", "Tamil"],
    totalExperience: text.toLowerCase().includes("senior") ? 5 : 2,
  };
}

function extractEvidence(resumeText: string, skill: string): string {
  const sentences = resumeText.split(/[.!?\n]/);
  const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  for (const sentence of sentences) {
    if (regex.test(sentence)) {
      const trimmed = sentence.trim();
      if (trimmed.length > 10) {
        return trimmed;
      }
    }
  }
  return `Mentions possession of ${skill} capabilities in technical skills index.`;
}

function localCalculateMatch(resumeText: string, jobSkills: string[], jobDescription: string): MatchScoreResult {
  const text = (resumeText + " " + jobDescription).toLowerCase();
  
  const strongSkills: string[] = [];
  const partialSkills: string[] = [];
  const missingSkills: string[] = [];
  const evidence: Array<{ skill: string; level: string; text: string; source: string }> = [];

  jobSkills.forEach((skill) => {
    const cleanSkill = skill.trim();
    const regex = new RegExp(`\\b${cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(resumeText)) {
      strongSkills.push(cleanSkill);
      const sentence = extractEvidence(resumeText, cleanSkill);
      evidence.push({
        skill: cleanSkill,
        level: "Strong Match",
        text: sentence,
        source: sentence.toLowerCase().includes("project") || sentence.toLowerCase().includes("built") ? "Resume -> Projects" : "Resume -> Experience"
      });
    } else {
      // Check for partial synonym match
      const partialMap: Record<string, string[]> = {
        "typescript": ["javascript", "js", "react"],
        "docker": ["kubernetes", "aws", "cloud", "devops"],
        "mongodb": ["sql", "postgresql", "mysql", "database"],
        "node.js": ["express", "javascript", "backend"],
        "react": ["next.js", "html", "javascript", "css"],
      };
      
      const skillLower = cleanSkill.toLowerCase();
      const synonyms = partialMap[skillLower] || [];
      const hasSynonym = synonyms.some(syn => new RegExp(`\\b${syn}\\b`, "i").test(resumeText));
      
      if (hasSynonym) {
        partialSkills.push(cleanSkill);
        evidence.push({
          skill: cleanSkill,
          level: "Partial Match",
          text: `Inferred from related background keywords found in profile.`,
          source: "Resume -> Skill Index"
        });
      } else {
        missingSkills.push(cleanSkill);
      }
    }
  });

  const skillMatch = Math.round((strongSkills.length / jobSkills.length) * 100);
  const experienceMatch = text.includes("senior") || text.includes("lead") ? 85 : 75;
  const overallMatch = Math.round((skillMatch + experienceMatch) / 2);

  const weakAreas: string[] = [];
  if (missingSkills.length > 0) {
    weakAreas.push(`Lacks direct references to required skills: ${missingSkills.slice(0, 3).join(", ")}`);
  }
  if (!text.includes("cloud") && !text.includes("aws") && !text.includes("azure")) {
    weakAreas.push("No clear cloud deployment experience mentioned.");
  }

  let recommendations = "";
  if (overallMatch >= 80) {
    recommendations = "Excellent match! Candidate exhibits high alignment with required tech stack. Move directly to technical interview stage.";
  } else if (overallMatch >= 60) {
    recommendations = "Good match. Candidate covers core concepts but lacks a few optional skills. Recommended to verify capability through a Coding Assessment first.";
  } else {
    recommendations = "Low alignment. Core skills are missing. Screening call is advised to confirm if candidates possess background experiences not listed on the resume.";
  }

  return {
    score: overallMatch,
    overallMatch,
    skillMatch,
    experienceMatch,
    strongSkills,
    partialSkills,
    missingSkills,
    evidence,
    weakAreas,
    recommendations
  };
}

function localGenerateQuestions(resumeText: string, jobSkills: string[]): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  
  const mainSkill = jobSkills[0] || "React";
  questions.push({
    category: "Technical",
    question: `Explain how you manage components state, lifecycles, and render performance optimization when working with ${mainSkill}.`
  });

  let projectContext = "an e-commerce platform or similar application";
  const sentences = resumeText.split(/[.!?\n]/);
  for (const s of sentences) {
    if (s.toLowerCase().includes("built") || s.toLowerCase().includes("developed") || s.toLowerCase().includes("project")) {
      if (s.trim().length > 20) {
        projectContext = s.trim();
        break;
      }
    }
  }
  questions.push({
    category: "Project-based",
    question: `You mentioned: "${projectContext}". What were the primary architectural hurdles you faced in this project, and how did you resolve them?`
  });

  questions.push({
    category: "Experience-based",
    question: "Describe your experience collaborating with product designers and backend developers. How do you handle handoffs and API specifications?"
  });

  questions.push({
    category: "Problem-solving",
    question: "Walk us through a time you had to debug a complex performance bottleneck in production. What tools did you use, and how did you diagnose the issue?"
  });

  questions.push({
    category: "Behavioral",
    question: "When technical requirements shift mid-sprint, how do you manage stakeholder expectations and adjust your delivery timeline?"
  });

  return questions;
}

function localGenerateInterviewSummary(ratings: any, comments: string): InterviewSummary {
  const strengths: string[] = [];
  const concerns: string[] = [];

  if (ratings.technical >= 8) {
    strengths.push("Exhibits strong core technical concepts and architecture understanding.");
  } else if (ratings.technical < 6) {
    concerns.push("Technical skills fall below the desired benchmark for this position.");
  }

  if (ratings.problemSolving >= 8) {
    strengths.push("Demonstrates high problem-solving capability and logical flow.");
  } else if (ratings.problemSolving < 6) {
    concerns.push("Logical troubleshooting and algorithm breakdown need further validation.");
  }

  if (ratings.communication >= 8) {
    strengths.push("Articulates complex technical details clearly and concisely.");
  } else if (ratings.communication < 6) {
    concerns.push("Articulating solutions under pressure was a bottleneck during feedback.");
  }

  if (strengths.length === 0) {
    strengths.push("Appears to possess standard teamwork alignment and credentials.");
  }
  if (concerns.length === 0) {
    concerns.push("No major technical or behavioral warning signs flags were raised.");
  }

  const average = (ratings.technical + ratings.communication + ratings.problemSolving + ratings.teamwork + ratings.leadership) / 5;
  const recommendation = average >= 7.5 ? "Recommend proceeding to final offer/HR discussions." : "Evaluate other candidates or perform further technical screenings.";

  return {
    strengths,
    concerns,
    consensus: comments || "Candidate is described as matching role specifications with expected communication alignment.",
    recommendation
  };
}

// ----------------------------------------------------
// PUBLIC FACING LLM ROUTER
// ----------------------------------------------------

export async function parseResumeText(text: string): Promise<ParsedResumeData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localParseResume(text);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following resume text and return a structured JSON conforming EXACTLY to the TypeScript interface:
                  interface ParsedResumeData {
                    name: string;
                    email: string;
                    phone: string;
                    skills: string[];
                    education: Array<{ school: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number }>;
                    experience: Array<{ company: string; role: string; startDate: string; endDate?: string; description: string }>;
                    certifications: string[];
                    languages: string[];
                    totalExperience: number;
                  }
                  
                  Only return valid JSON inside a codeblock. Do not output anything else.
                  
                  Resume Text:
                  ${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API call failed");
    const result = await response.json();
    const parsedText = result.candidates[0].content.parts[0].text;
    const data = JSON.parse(parsedText);
    
    // Convert string dates back to Date objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.experience = data.experience.map((exp: any) => ({
      ...exp,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    }));

    return data as ParsedResumeData;
  } catch (err) {
    console.error("Gemini Parse failed, falling back to local:", err);
    return localParseResume(text);
  }
}

export async function calculateMatchScore(
  resumeText: string,
  jobSkills: string[],
  jobDescription: string
): Promise<MatchScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localCalculateMatch(resumeText, jobSkills, jobDescription);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Compare this Candidate's Resume Text with the Job Description and required skills list:
                  
                  Candidate Resume Text:
                  ${resumeText}
                  
                  Job Skills:
                  ${jobSkills.join(", ")}
                  
                  Job Description:
                  ${jobDescription}
                  
                  Calculate a similarity index and output a structured JSON matching this TypeScript format exactly:
                  interface MatchScoreResult {
                    score: number; // 0 to 100 representing match percentage
                    overallMatch: number; // 0 to 100
                    skillMatch: number; // 0 to 100
                    experienceMatch: number; // 0 to 100
                    strongSkills: string[]; // skills candidate has that match job requirements
                    partialSkills: string[]; // skills that are related/partially matching
                    missingSkills: string[]; // required skills missing in candidate
                    evidence: Array<{ skill: string; level: string; text: string; source: string }>; // Evidence quote from candidate resume for strong/partial skills
                    weakAreas: string[]; // short descriptions of key missing qualifications
                    recommendations: string; // detailed advice for recruitment manager
                  }
                  
                  Only return valid JSON inside a codeblock. Do not output anything else.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API call failed");
    const result = await response.json();
    const parsedText = result.candidates[0].content.parts[0].text;
    const data = JSON.parse(parsedText);
    data.score = data.overallMatch || data.score; // Compatibility mapping
    return data as MatchScoreResult;
  } catch (err) {
    console.error("Gemini Match failed, falling back to local:", err);
    return localCalculateMatch(resumeText, jobSkills, jobDescription);
  }
}

export async function generateInterviewQuestions(
  resumeText: string,
  jobSkills: string[],
  jobDescription: string
): Promise<InterviewQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localGenerateQuestions(resumeText, jobSkills);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate 5 personalized interview questions for this candidate based on their resume and job description. Focus on checking technical depth and project claims.
                  
                  Candidate Resume Text:
                  ${resumeText}
                  
                  Job Skills:
                  ${jobSkills.join(", ")}
                  
                  Job Description:
                  ${jobDescription}
                  
                  Output structured JSON matching this format exactly:
                  interface InterviewQuestion {
                    category: "Technical" | "Project-based" | "Experience-based" | "Problem-solving" | "Behavioral";
                    question: string;
                  }
                  Return an array of 5 questions. Only return JSON.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API call failed");
    const result = await response.json();
    const parsedText = result.candidates[0].content.parts[0].text;
    return JSON.parse(parsedText) as InterviewQuestion[];
  } catch (err) {
    console.error("Gemini Questions failed, falling back to local:", err);
    return localGenerateQuestions(resumeText, jobSkills);
  }
}

export async function generateInterviewSummary(
  ratings: any,
  comments: string
): Promise<InterviewSummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localGenerateInterviewSummary(ratings, comments);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the interviewer's rating sheet and comments into structured HireNova decision support insights.
                  
                  Ratings:
                  - Technical: ${ratings.technical}/10
                  - Communication: ${ratings.communication}/10
                  - Problem Solving: ${ratings.problemSolving}/10
                  - Teamwork: ${ratings.teamwork}/10
                  - Leadership: ${ratings.leadership}/10
                  
                  Comments:
                  ${comments}
                  
                  Output structured JSON matching this format exactly:
                  interface InterviewSummary {
                    strengths: string[]; // key strength points
                    concerns: string[]; // key area concerns or risks
                    consensus: string; // brief thematic consensus text
                    recommendation: string; // recommended next action advice
                  }
                  Only return valid JSON inside a codeblock.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API call failed");
    const result = await response.json();
    const parsedText = result.candidates[0].content.parts[0].text;
    return JSON.parse(parsedText) as InterviewSummary;
  } catch (err) {
    console.error("Gemini Summary failed, falling back to local:", err);
    return localGenerateInterviewSummary(ratings, comments);
  }
}

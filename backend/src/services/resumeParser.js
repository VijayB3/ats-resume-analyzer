// src/services/resumeParser.js
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
};

// Extract text from DOCX
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Error parsing DOCX: ${error.message}`);
  }
};

// Parse resume based on file type
const parseResume = async (filePath, fileType) => {
  let rawText = '';
  
  if (fileType === 'pdf') {
    rawText = await extractTextFromPDF(filePath);
  } else if (fileType === 'docx') {
    rawText = await extractTextFromDOCX(filePath);
  } else {
    throw new Error('Unsupported file type');
  }

  // Parse the text to extract structured data
  const parsedData = parseResumeText(rawText);
  
  return {
    rawText,
    parsedData
  };
};

// Parse resume text to extract sections
const parseResumeText = (text) => {
  const parsed = {
    summary: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    contact: {}
  };

  // Extract contact info
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  if (emailMatch) parsed.contact.email = emailMatch[1];

  const phoneMatch = text.match(/(\+?1?\s?)?\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/g);
  if (phoneMatch) parsed.contact.phone = phoneMatch[0];

  const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i);
  if (linkedinMatch) parsed.contact.linkedin = linkedinMatch[0];

  const githubMatch = text.match(/github\.com\/([\w-]+)/i);
  if (githubMatch) parsed.contact.github = githubMatch[0];

  // Extract sections
  const sections = {
    summary: extractSection(text, ['summary', 'professional summary', 'profile']),
    skills: extractSkills(text),
    experience: extractExperience(text),
    projects: extractProjects(text),
    education: extractEducation(text),
    certifications: extractCertifications(text)
  };

  return { ...parsed, ...sections };
};

// Extract specific section from resume
const extractSection = (text, keywords) => {
  const regex = new RegExp(`(${keywords.join('|')})([\s\S]*?)(?=^[a-z]+$|$)`, 'im');
  const match = text.match(regex);
  return match ? match[2].trim().substring(0, 500) : '';
};

// Extract skills
const extractSkills = (text) => {
  const skillKeywords = [
    'docker', 'kubernetes', 'aws', 'linux', 'jenkins', 'terraform', 'git',
    'python', 'java', 'go', 'bash', 'shell', 'cicd', 'ci/cd', 'ansible',
    'prometheus', 'grafana', 'elk', 'elasticsearch', 'nginx', 'apache',
    'mysql', 'postgresql', 'mongodb', 'redis', 'rabbitmq', 'kafka',
    'microservices', 'devops', 'iaac', 'iac', 'cloud', 'azure', 'gcp'
  ];

  const found = [];
  const textLower = text.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (textLower.includes(skill) && !found.includes(skill)) {
      found.push(skill);
    }
  });

  return found;
};

// Extract experience
const extractExperience = (text) => {
  const experiences = [];
  const expRegex = /([a-zA-Z\s]+)\s*(?:at|@)\s*([a-zA-Z\s]+)\s*\(([^)]+)\)/gi;
  let match;

  while ((match = expRegex.exec(text)) !== null) {
    experiences.push({
      position: match[1].trim(),
      company: match[2].trim(),
      duration: match[3].trim()
    });
  }

  return experiences;
};

// Extract projects
const extractProjects = (text) => {
  const projects = [];
  const lines = text.split('\n');
  let currentProject = null;

  lines.forEach(line => {
    if (line.includes('project') || line.includes('built') || line.includes('developed')) {
      if (currentProject) projects.push(currentProject);
      currentProject = {
        name: line.substring(0, 50),
        description: '',
        technologies: []
      };
    } else if (currentProject) {
      currentProject.description += line + ' ';
    }
  });

  if (currentProject) projects.push(currentProject);
  return projects.slice(0, 5);
};

// Extract education
const extractEducation = (text) => {
  const educations = [];
  const eduKeywords = ['btech', 'be', 'mtech', 'ms', 'ma', 'ba', 'bs', 'bachelor', 'master', 'diploma'];
  const lines = text.split('\n');

  lines.forEach(line => {
    if (eduKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      educations.push({
        institution: line.substring(0, 50),
        degree: 'Degree',
        field: 'Field'
      });
    }
  });

  return educations;
};

// Extract certifications
const extractCertifications = (text) => {
  const certifications = [];
  const certKeywords = ['certified', 'certification', 'credential', 'aws', 'ckad', 'cka'];
  const lines = text.split('\n');

  lines.forEach(line => {
    if (certKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      certifications.push(line.trim());
    }
  });

  return certifications;
};

module.exports = {
  parseResume,
  extractTextFromPDF,
  extractTextFromDOCX,
  parseResumeText
};
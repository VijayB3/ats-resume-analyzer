// src/services/atsScorer.js

/**
 * DevOps-focused ATS Scoring Algorithm
 * Scores out of 100 based on:
 * - Formatting (20%)
 * - Keywords (25%)
 * - Sections (20%)
 * - Readability (15%)
 * - DevOps Skills Match (20%)
 */

const DEVOPS_KEYWORDS = {
  docker: ['docker', 'containerization', 'container'],
  kubernetes: ['kubernetes', 'k8s', 'orchestration'],
  aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds'],
  linux: ['linux', 'centos', 'ubuntu', 'rhel'],
  jenkins: ['jenkins', 'ci/cd pipeline', 'automation'],
  terraform: ['terraform', 'iaac', 'iac', 'infrastructure as code'],
  git: ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  cicd: ['ci/cd', 'continuous integration', 'continuous deployment'],
  bash: ['bash', 'shell script', 'scripting'],
  monitoring: ['prometheus', 'grafana', 'elk', 'datadog', 'newrelic', 'splunk']
};

const REQUIRED_SECTIONS = ['summary', 'skills', 'experience', 'education'];

const calculateATSScore = (parsedData, rawText) => {
  let scores = {
    formatting: calculateFormattingScore(rawText),
    keywords: calculateKeywordScore(rawText),
    sections: calculateSectionsScore(parsedData),
    readability: calculateReadabilityScore(rawText),
    devopsSkills: calculateDevOpsSkillsScore(parsedData)
  };

  // Weighted calculation
  const totalScore = 
    (scores.formatting.score * 0.20) +
    (scores.keywords * 0.25) +
    (scores.sections.score * 0.20) +
    (scores.readability * 0.15) +
    (scores.devopsSkills * 0.20);

  return {
    overallScore: Math.round(totalScore),
    ...scores,
    breakdown: {
      formatting: `${scores.formatting.score}%`,
      keywords: `${scores.keywords}%`,
      sections: `${scores.sections.score}%`,
      readability: `${scores.readability}%`,
      devopsSkills: `${scores.devopsSkills}%`
    }
  };
};

const calculateFormattingScore = (text) => {
  let score = 100;
  const issues = [];

  // Check for tables
  if (text.includes('|') && text.includes('---')) {
    score -= 15;
    issues.push('Resume contains tables (ATS may not parse correctly)');
  }

  // Check for special characters and graphics
  const specialCharCount = (text.match(/[★●■◆]/g) || []).length;
  if (specialCharCount > 3) {
    score -= 10;
    issues.push('Too many special characters or graphics');
  }

  // Check line length for readability
  const lines = text.split('\\n');
  const longLines = lines.filter(line => line.length > 100).length;
  if (longLines > lines.length * 0.5) {
    score -= 5;
    issues.push('Lines are too long, affecting readability');
  }

  return { score: Math.max(0, score), issues };
};

const calculateKeywordScore = (text) => {
  let score = 0;
  let foundKeywords = 0;
  const textLower = text.toLowerCase();

  Object.values(DEVOPS_KEYWORDS).forEach(keywords => {
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        foundKeywords++;
      }
    });
  });

  // Maximum 40 keywords
  score = Math.min(100, (foundKeywords / 40) * 100);
  return Math.round(score);
};

const calculateSectionsScore = (parsedData) => {
  let score = 0;
  const sections = {
    summary: parsedData.summary ? true : false,
    skills: parsedData.skills && parsedData.skills.length > 0 ? true : false,
    experience: parsedData.experience && parsedData.experience.length > 0 ? true : false,
    projects: parsedData.projects && parsedData.projects.length > 0 ? true : false,
    education: parsedData.education && parsedData.education.length > 0 ? true : false,
    certifications: parsedData.certifications && parsedData.certifications.length > 0 ? true : false
  };

  const foundSections = Object.values(sections).filter(s => s).length;
  score = (foundSections / 6) * 100;

  return {
    score: Math.round(score),
    found: sections,
    missing: Object.keys(sections).filter(s => !sections[s])
  };
};

const calculateReadabilityScore = (text) => {
  let score = 100;
  
  // Check word count (ideal 400-600 words)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 300 || wordCount > 800) {
    score -= 10;
  }

  // Check line spacing
  const paragraphs = text.split('\\n\\n').length;
  if (paragraphs < 5) {
    score -= 10;
  }

  // Check sentence length (average should be < 25 words)
  const sentences = text.split(/[.!?]+/);
  const avgSentenceLength = text.split(/\s+/).length / sentences.length;
  if (avgSentenceLength > 25) {
    score -= 5;
  }

  return Math.max(0, score);
};

const calculateDevOpsSkillsScore = (parsedData) => {
  let score = 0;
  const skills = parsedData.skills || [];
  const devopsSkillsFound = [];

  Object.entries(DEVOPS_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (skills.some(skill => skill.toLowerCase().includes(keyword))) {
        devopsSkillsFound.push(category);
      }
    });
  });

  const uniqueSkills = [...new Set(devopsSkillsFound)].length;
  score = (uniqueSkills / 10) * 100;

  return Math.round(score);
};

const generateSuggestions = (atsScore) => {
  const suggestions = [];

  if (atsScore.formatting.score < 80) {
    suggestions.push('Remove tables, graphics, and special characters for better ATS compatibility');
  }
  if (atsScore.keywords < 70) {
    suggestions.push('Add more relevant DevOps keywords to your resume');
  }
  if (atsScore.sections.score < 80) {
    suggestions.push(`Add missing sections: ${atsScore.sections.missing.join(', ')}`);
  }
  if (atsScore.readability < 70) {
    suggestions.push('Improve readability with better formatting and shorter sentences');
  }

  return suggestions;
};

module.exports = {
  calculateATSScore,
  generateSuggestions,
  DEVOPS_KEYWORDS
};

// src/services/jobMatcher.js
const stringSimilarity = require('string-similarity');

const DEVOPS_KEYWORDS_MASTER_LIST = [
  'docker', 'kubernetes', 'aws', 'linux', 'jenkins', 'terraform', 'git',
  'cicd', 'ci/cd', 'ansible', 'prometheus', 'grafana', 'elk', 'nginx',
  'python', 'bash', 'shell', 'microservices', 'mysql', 'postgresql',
  'mongodb', 'redis', 'kafka', 'rabbitmq', 'azure', 'gcp', 'devops',
  'iaac', 'iac', 'automation', 'monitoring', 'logging', 'apache', 'ruby',
  'golang', 'go', 'java', 'agile', 'scrum'
];

/**
 * Match resume with job description
 * Returns match percentage and keyword analysis
 */
const matchResumeWithJD = (resumeText, jobDescription) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescription);

  // Find matched and missing keywords
  const matchedKeywords = resumeKeywords.filter(keyword =>
    jdKeywords.some(jdKeyword => isSimilarKeyword(keyword, jdKeyword))
  );

  const missingKeywords = jdKeywords.filter(keyword =>
    !resumeKeywords.some(resumeKeyword => isSimilarKeyword(keyword, resumeKeyword))
  );

  // Calculate match percentage
  const matchPercentage = jdKeywords.length > 0
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
    : 0;

  return {
    matchPercentage,
    matchedKeywords: [...new Set(matchedKeywords)],
    missingKeywords: [...new Set(missingKeywords)],
    totalJDKeywords: jdKeywords.length,
    totalResumeKeywords: resumeKeywords.length,
    matchedPercentage: matchPercentage
  };
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text) => {
  const textLower = text.toLowerCase();
  const keywords = [];

  DEVOPS_KEYWORDS_MASTER_LIST.forEach(keyword => {
    if (textLower.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  return keywords;
};

/**
 * Check if two keywords are similar
 */
const isSimilarKeyword = (keyword1, keyword2) => {
  const similarity = stringSimilarity.compareTwoStrings(keyword1, keyword2);
  return similarity > 0.6 || keyword1 === keyword2;
};

/**
 * Generate improvement suggestions based on job match
 */
const generateMatchSuggestions = (matchResult) => {
  const suggestions = [];

  if (matchResult.matchPercentage < 50) {
    suggestions.push('Add more relevant keywords from the job description to your resume');
  }

  if (matchResult.missingKeywords.length > 0) {
    const topMissing = matchResult.missingKeywords.slice(0, 5).join(', ');
    suggestions.push(`Consider adding these skills if you have them: ${topMissing}`);
  }

  if (matchResult.matchedKeywords.length < 5) {
    suggestions.push('Your resume seems to lack key technical skills mentioned in the job description');
  }

  return suggestions;
};

module.exports = {
  matchResumeWithJD,
  extractKeywords,
  generateMatchSuggestions
};

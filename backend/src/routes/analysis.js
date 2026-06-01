// src/routes/analysis.js
const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');
const { calculateATSScore, generateSuggestions, DEVOPS_KEYWORDS } = require('../services/atsScorer');
const { matchResumeWithJD, generateMatchSuggestions } = require('../services/jobMatcher');

// @route   POST /api/analysis/ats-score
// @desc    Calculate ATS score for resume
// @access  Private
router.post('/ats-score/:resumeId', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume || resume.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { status: 404, message: 'Resume not found' }
      });
    }

    const atsScore = calculateATSScore(resume.parsedData, resume.rawText);
    const suggestions = generateSuggestions(atsScore);

    res.status(200).json({
      success: true,
      data: {
        overallScore: atsScore.overallScore,
        breakdown: atsScore.breakdown,
        formatting: atsScore.formatting,
        keywords: atsScore.keywords,
        sections: atsScore.sections,
        readability: atsScore.readability,
        devopsSkills: atsScore.devopsSkills,
        suggestions,
        improvements: [
          {
            category: 'Formatting',
            current: atsScore.formatting.score,
            issues: atsScore.formatting.issues
          },
          {
            category: 'Keywords',
            current: atsScore.keywords,
            recommendation: 'Add more DevOps-specific keywords'
          },
          {
            category: 'Sections',
            current: atsScore.sections.score,
            missing: atsScore.sections.missing
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { status: 500, message: error.message }
    });
  }
});

// @route   POST /api/analysis/devops-skills
// @desc    Analyze DevOps skills in resume
// @access  Private
router.post('/devops-skills/:resumeId', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume || resume.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { status: 404, message: 'Resume not found' }
      });
    }

    const skills = resume.parsedData.skills || [];
    const devopsAnalysis = {\n      matchedSkills: [],\n      missingSkills: [],\n      skillsBreakdown: {}\n    };\n\n    // Check each DevOps skill category\n    Object.entries(DEVOPS_KEYWORDS).forEach(([category, keywords]) => {\n      const found = keywords.filter(keyword =>\n        skills.some(skill => skill.toLowerCase().includes(keyword))\n      );\n      \n      if (found.length > 0) {\n        devopsAnalysis.matchedSkills.push(category);\n        devopsAnalysis.skillsBreakdown[category] = found;\n      } else {\n        devopsAnalysis.missingSkills.push(category);\n      }\n    });\n\n    const skillsScore = (devopsAnalysis.matchedSkills.length / Object.keys(DEVOPS_KEYWORDS).length) * 100;\n\n    res.status(200).json({\n      success: true,\n      data: {\n        overallDevOpsScore: Math.round(skillsScore),\n        matchedSkills: devopsAnalysis.matchedSkills,\n        missingSkills: devopsAnalysis.missingSkills,\n        skillsBreakdown: devopsAnalysis.skillsBreakdown,\n        recommendations: [\n          ...devopsAnalysis.missingSkills.slice(0, 3).map(skill => `Consider learning ${skill}`)\n        ],\n        totalSkillsFound: resume.parsedData.skills.length\n      }\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      error: { status: 500, message: error.message }\n    });\n  }\n});\n\n// @route   POST /api/analysis/job-match\n// @desc    Match resume with job description\n// @access  Private\nrouter.post('/job-match/:resumeId', protect, async (req, res) => {\n  try {\n    const { jobDescription } = req.body;\n\n    if (!jobDescription) {\n      return res.status(400).json({\n        success: false,\n        error: { status: 400, message: 'Job description is required' }\n      });\n    }\n\n    const resume = await Resume.findById(req.params.resumeId);\n\n    if (!resume || resume.userId.toString() !== req.user.id) {\n      return res.status(404).json({\n        success: false,\n        error: { status: 404, message: 'Resume not found' }\n      });\n    }\n\n    const matchResult = matchResumeWithJD(resume.rawText, jobDescription);\n    const suggestions = generateMatchSuggestions(matchResult);\n\n    // Update resume with job match analysis\n    resume.jobMatchAnalysis = {\n      jobDescription,\n      matchPercentage: matchResult.matchPercentage,\n      matchedKeywords: matchResult.matchedKeywords,\n      missingKeywords: matchResult.missingKeywords,\n      matchedAt: new Date()\n    };\n    await resume.save();\n\n    res.status(200).json({\n      success: true,\n      data: {\n        matchPercentage: matchResult.matchPercentage,\n        matchedKeywords: matchResult.matchedKeywords,\n        missingKeywords: matchResult.missingKeywords,\n        totalResumeKeywords: matchResult.totalResumeKeywords,\n        totalJDKeywords: matchResult.totalJDKeywords,\n        suggestions,\n        keywordAnalysis: {\n          matched: matchResult.matchedKeywords.length,\n          missing: matchResult.missingKeywords.length,\n          coverage: `${matchResult.matchPercentage}%`\n        }\n      }\n    });\n  } catch (error) {\n    res.status(500).json({\n      success: false,\n      error: { status: 500, message: error.message }\n    });\n  }\n});\n\nmodule.exports = router;

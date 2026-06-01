// src/routes/resumes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');
const { parseResume } = require('../services/resumeParser');
const { calculateATSScore, generateSuggestions } = require('../services/atsScorer');
const { matchResumeWithJD } = require('../services/jobMatcher');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// @route   POST /api/resumes/upload
// @desc    Upload and parse resume
// @access  Private
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { status: 400, message: 'No file uploaded' }
      });
    }

    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
    const { rawText, parsedData } = await parseResume(req.file.path, fileType);

    // Calculate ATS score
    const atsScore = calculateATSScore(parsedData, rawText);
    const suggestions = generateSuggestions(atsScore);

    // Create resume document
    const resume = new Resume({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileType,
      filePath: req.file.path,
      fileSize: req.file.size,
      rawText,
      parsedData,
      atsAnalysis: {
        overallScore: atsScore.overallScore,
        formattingScore: atsScore.formatting.score,
        keywordScore: atsScore.keywords,
        structureScore: atsScore.sections.score,
        readabilityScore: atsScore.readability,
        issuesFound: atsScore.formatting.issues,
        suggestions
      }
    });

    await resume.save();

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume._id,
        fileName: resume.fileName,
        atsScore: atsScore.overallScore,
        analysis: resume.atsAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { status: 500, message: error.message }
    });
  }
});

// @route   GET /api/resumes
// @desc    Get all user resumes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id, isDeleted: false })
      .select('-rawText')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { status: 500, message: error.message }
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume || resume.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { status: 404, message: 'Resume not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { status: 500, message: error.message }
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume || resume.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { status: 404, message: 'Resume not found' }
      });
    }

    resume.isDeleted = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { status: 500, message: error.message }
    });
  }
});

module.exports = router;

// src/models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  rawText: {
    type: String,
    required: true
  },
  parsedData: {
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: String
    }],
    certifications: [String],
    contact: {
      email: String,
      phone: String,
      linkedin: String,
      github: String
    }
  },
  atsAnalysis: {
    overallScore: {
      type: Number,
      default: 0
    },
    formattingScore: Number,
    keywordScore: Number,
    structureScore: Number,
    readabilityScore: Number,
    issuesFound: [String],
    suggestions: [String],
    strengths: [String]
  },
  devopsAnalysis: {
    matchedSkills: [String],
    missingSkills: [String],
    relevanceScore: Number,
    technologies: {
      docker: { type: Number, default: 0 },
      kubernetes: { type: Number, default: 0 },
      aws: { type: Number, default: 0 },
      linux: { type: Number, default: 0 },
      jenkins: { type: Number, default: 0 },
      terraform: { type: Number, default: 0 },
      git: { type: Number, default: 0 },
      cicd: { type: Number, default: 0 },
      shellScripting: { type: Number, default: 0 },
      monitoring: { type: Number, default: 0 }
    }
  },
  jobMatchAnalysis: {
    jobDescription: String,
    matchPercentage: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    matchedAt: Date
  },
  version: {
    type: Number,
    default: 1
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema);

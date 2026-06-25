# ATS Resume Analyzer - DevOps Fresher Edition.

A modern AI-powered ATS (Applicant Tracking System) Resume Analyzer web application designed specifically for Fresher DevOps Engineers. Analyze your resume against industry standards, optimize for DevOps roles, and get actionable insights to land your dream job.

## 🚀 Features

### 1. Resume Upload System
- Upload PDF and DOCX resumes
- Drag and drop functionality
- Resume preview after upload

### 2. ATS Resume Scanner
- Analyze resume formatting and ATS compatibility
- Detect missing sections (Summary, Skills, Experience, Projects, Certifications, Education)
- Check keyword optimization for DevOps roles
- Detect readability issues, bad formatting, tables, icons, graphics
- Check resume length and section balance

### 3. DevOps Fresher Analysis
- Compare resume with job descriptions
- Analyze 10+ DevOps technologies: Docker, Kubernetes, AWS, Linux, Jenkins, Terraform, Git, CI/CD, Shell Scripting, Monitoring Tools
- Suggest missing skills and technologies

### 4. ATS Score Dashboard
- ATS score out of 100
- Resume strengths and weak areas
- Missing keywords and formatting issues
- Improvement suggestions

### 5. AI-Powered Suggestions
- Generate improved resume bullet points
- Suggest better action verbs
- Optimize project descriptions
- Role-specific recommendations

### 6. Job Description Matching
- Paste job descriptions
- Calculate resume match percentage
- Highlight matched and missing keywords

### 7. Modern UI/UX
- Professional SaaS-style dashboard
- Dark/Light mode
- Responsive design
- Animated charts and progress bars

## 📊 Tech Stack

### Frontend
- **React.js** with Next.js (optional)
- **Tailwind CSS** for styling
- **Recharts** for analytics
- **Framer Motion** for animations
- **React Hook Form** for file uploads

### Backend
- **Node.js + Express.js**
- **Python FastAPI** (alternative)
- Resume parsing with **pdfjs**, **docx** libraries
- NLP with **natural** library
- OpenAI/Gemini API integration

### Database
- **MongoDB** (primary)
- **PostgreSQL** (alternative)

### DevOps & Deployment
- Docker containerization
- GitHub Actions CI/CD
- AWS deployment ready

## 📁 Project Structure

```
ats-resume-analyzer/
├── frontend/                 # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # App pages
│   │   ├── styles/          # Tailwind CSS
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Helper functions
│   │   └── context/         # React Context
│   └── package.json
├── backend/                  # Node.js + Express Backend
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── middleware/          # Auth, validation
│   ├── services/            # Resume parsing, NLP
│   ├── utils/               # Helper functions
│   └── package.json
├── database/                # Database schemas and migrations
├── docker/                  # Docker configuration
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+ (optional)
- MongoDB Atlas account or local MongoDB
- Docker (optional)

### Installation

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Docker Setup
```bash
docker-compose up
```

## 🔑 Key Technologies

### Resume Parsing
- **pdf-parse** - Extract text from PDFs
- **docx** - Parse DOCX files
- **pdf2pic** - Convert PDF to images for preview

### NLP & Analysis
- **natural** - Tokenization and keyword extraction
- **compromise** - Natural language processing
- **similarity** - Text similarity matching

### AI Integration
- **OpenAI API** - Generate suggestions
- **Google Gemini API** - Alternative AI provider

### Charts & Visualization
- **Recharts** - Interactive charts
- **Chart.js** - Advanced visualizations

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Resume Endpoints
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes/:id` - Get resume details
- `GET /api/resumes` - List user resumes
- `DELETE /api/resumes/:id` - Delete resume

### Analysis Endpoints
- `POST /api/analyze/ats-score` - Get ATS score
- `POST /api/analyze/devops-skills` - Analyze DevOps skills
- `POST /api/analyze/job-match` - Match with JD
- `POST /api/analyze/suggestions` - Get AI suggestions

## 📊 ATS Scoring Algorithm

The ATS score is calculated based on:
- **Formatting (20%)** - Clean structure, no tables/images
- **Keywords (25%)** - Relevant DevOps keywords
- **Sections (20%)** - Presence of required sections
- **Readability (15%)** - Font, spacing, length
- **Skills Match (20%)** - Relevant skills for DevOps

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

## 🚀 Deployment

### AWS Deployment
- Frontend: S3 + CloudFront
- Backend: EC2 or ECS
- Database: RDS or MongoDB Atlas

### Vercel Deployment (Frontend)
```bash
vercel deploy
```

### Heroku Deployment (Backend)
```bash
heroku create
git push heroku main
```

## 📈 Future Enhancements

- [ ] Video resume analysis
- [ ] Interview preparation module
- [ ] Salary insights for DevOps roles
- [ ] Cover letter generator
- [ ] LinkedIn profile optimization
- [ ] Real-time collaboration features
- [ ] Browser extension for job applications

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions are welcome! Please follow the contribution guidelines.

## 📧 Support

For support, email support@atsanalyzer.com or create an issue on GitHub.

---

**Built with ❤️ for Fresher DevOps Engineers**

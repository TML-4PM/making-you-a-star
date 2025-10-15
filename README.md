# Make me a STAR ⭐

### Master Behavioral Interviews with AI-Powered STAR Method

> A comprehensive React-based platform for managing interview stories, analyzing job descriptions, and preparing for behavioral interviews using AI-powered insights.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-FF6B6B)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)

---

## 📖 What is "Make me a STAR"?

**Make me a STAR** is an intelligent interview preparation platform designed to help job seekers master behavioral interviews using the proven **STAR method** (Situation, Task, Action, Result).

The platform combines:
- 📝 **Story Management** - Organize your professional experiences
- 🤖 **AI Analysis** - Get intelligent feedback powered by OpenAI GPT-4
- 🎯 **Job Matching** - Match your stories to specific job requirements
- 🎴 **Practice Tools** - Flashcard-based learning and timed sessions
- 📊 **Analytics** - Track your progress and readiness

### What is the STAR Method?

The STAR method is a structured approach to answering behavioral interview questions:

- **S**ituation: Set the context for your story
- **T**ask: Describe the challenge or responsibility
- **A**ction: Explain the specific steps you took
- **R**esult: Share the outcomes and lessons learned

---

## 👥 Who is This For?

### Primary Users
- **Job Seekers** - Preparing for behavioral interviews at any career level
- **Career Changers** - Building a portfolio of transferable skill stories
- **Students & Graduates** - Developing professional interview skills
- **Interview Coaches** - Training clients with structured methodologies

### Use Cases
- ✅ Preparing for technical and non-technical interviews
- ✅ Building a personal story library for networking
- ✅ Tailoring responses to specific job descriptions
- ✅ Practicing under timed conditions
- ✅ Tracking interview readiness and confidence

---

## 🚀 Key Features

### 📚 Story Management
- **Import Stories** - Upload via Excel/CSV or enter manually
- **60+ Examples** - Pre-loaded professional story templates
- **Advanced Search** - Find stories by theme, organization, or keywords
- **Story Groups** - Organize by job type, skill, or company
- **Bookmarking** - Quick access to favorite stories

### 🤖 AI-Powered Analysis
- **Quality Scoring** - Automatic assessment of story completeness
- **Optimization Suggestions** - AI-driven improvements for clarity and impact
- **Theme Extraction** - Identify key skills and competencies
- **Bulk Analysis** - Analyze multiple stories simultaneously
- **Real-time Feedback** - Instant suggestions as you write

### 🎯 Job Description Matching
- **Intelligent Parsing** - Extract key themes and requirements from job posts
- **Story Recommendations** - AI suggests your best-fit stories
- **Skills Gap Analysis** - Identify missing experiences
- **Competitive Intelligence** - Understand what employers value

### 🎴 Interview Practice
- **Flashcard Sessions** - Interactive question-and-answer practice
- **Timed Practice** - Simulate real interview conditions
- **Confidence Tracking** - Self-assess your comfort level
- **Progress Analytics** - Visualize improvement over time
- **Readiness Score** - Quantified interview preparedness

### 📊 Study & Analytics
- **Practice History** - Review past sessions and performance
- **Story Coverage** - Track which stories you've practiced
- **Time Investment** - Monitor study time and frequency
- **Performance Trends** - Identify strengths and weaknesses

### 🔗 Embeddable Widget
- **Share Prep Tools** - Embed interview prep on career sites
- **QR Code Access** - Quick mobile access to practice sessions
- **Customizable** - Match your organization's branding

---

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and suspense
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom design system
- **shadcn/ui** - Beautiful, accessible component library

### Backend & Infrastructure
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level authorization
- **Edge Functions** - Serverless TypeScript functions
- **Authentication** - Email/password and OAuth providers
- **Storage** - Secure file uploads for Excel/CSV imports

### AI & Integrations
- **OpenAI GPT-4** - Story analysis and optimization
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **XLSX** - Excel file processing
- **Recharts** - Data visualization

---

## 📦 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Supabase Account** - [Sign up free](https://supabase.com)
- **OpenAI API Key** - Required for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The app uses Supabase for backend services. Environment variables are configured in the project:
   - Supabase Project ID: `pflisxkcxbzboxwidywf`
   - Supabase Anon Key: (configured in project)

4. **Configure OpenAI API Key**
   
   Add your OpenAI API key to Supabase Edge Functions secrets:
   - Go to Supabase Dashboard → Project Settings → Edge Functions
   - Add secret: `OPENAI_API_KEY=your-key-here`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the app**
   
   Open [http://localhost:8080](http://localhost:8080) in your browser

---

## 🎓 User Guide - Quick Start

### 1️⃣ Add Your First Story

**Option A: Import from Excel**
1. Navigate to **Upload** page
2. Download the template Excel file
3. Fill in your stories using the STAR format
4. Upload the completed file

**Option B: Manual Entry**
1. Navigate to **Stories** page
2. Click "Add New Story"
3. Fill in all STAR components
4. Save and tag your story

### 2️⃣ Analyze a Job Description

1. Navigate to **Job Descriptions** page
2. Click "Add Job Description"
3. Paste the full job posting
4. AI extracts key themes and requirements
5. Get recommended stories that match

### 3️⃣ Practice with Flashcards

1. Navigate to **Practice** page
2. Select stories to include (or use all)
3. Start a timed or untimed session
4. Answer prompts and rate your confidence
5. Review analytics after completion

### 4️⃣ Organize with Groups

1. Navigate to **Groups** page
2. Create groups by job type, company, or skill
3. Add stories to relevant groups
4. Use groups to filter practice sessions

### 5️⃣ Track Your Progress

1. Navigate to **Practice** → **Analytics** tab
2. View readiness score (0-100)
3. Monitor practice frequency and coverage
4. Identify stories needing more practice

---

## 👨‍💻 For Developers

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui primitives
│   ├── auth/           # Authentication components
│   └── ...             # Feature components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client setup
├── utils/              # Utility functions
└── lib/                # Shared libraries

supabase/
├── functions/          # Edge Functions (serverless)
│   ├── analyze-story/
│   ├── analyze-job-description/
│   └── bulk-analyze-stories/
└── migrations/         # Database schema versions
```

### Key Components
- **InterviewPrepTool** - Main landing page hero
- **StoryManagement** - CRUD operations for stories
- **JobAnalysisResults** - Job description analysis UI
- **PracticeFlashcards** - Practice session manager
- **AnalyticsDashboard** - Progress visualization

### Custom Hooks
- `useAuth()` - Authentication state and methods
- `useStoryGroups()` - Story group management
- `useJobDescriptions()` - Job description CRUD
- `useBookmarks()` - Bookmark functionality
- `useHeroImage()` - Landing page hero customization

### Database Schema

**Core Tables:**
- `profiles` - User profile data
- `interview_stories` - User's STAR method stories
- `job_descriptions` - Saved job postings with AI analysis
- `story_groups` - Organizational collections
- `practice_sessions` - Practice history and results
- `practice_items` - Individual flashcard responses
- `user_analytics` - Aggregated performance metrics

### Edge Functions

**analyze-story** - Analyzes a single story for quality and themes
```typescript
POST /analyze-story
Body: { content: string, user_id: string }
Returns: { analysis, quality_score, themes }
```

**analyze-job-description** - Extracts themes from job postings
```typescript
POST /analyze-job-description
Body: { description: string }
Returns: { themes, required_skills, recommendations }
```

**bulk-analyze-stories** - Batch processes multiple stories
```typescript
POST /bulk-analyze-stories
Body: { story_ids: string[] }
Returns: { results: Array<analysis> }
```

### Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Documentation Hub

Comprehensive documentation is available:

- **[Architecture Guide](ARCHITECTURE.md)** - System design and technical architecture
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[User Guide](USER_GUIDE.md)** - Step-by-step user manual
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Sitemap Guide](SITEMAP_GUIDE.md)** - SEO and sitemap maintenance

---

## 🔍 SEO & Production

### SEO Implementation
- ✅ **XML Sitemap** - `/public/sitemap.xml` with all routes
- ✅ **Robots.txt** - Proper crawler directives
- ✅ **Meta Tags** - Comprehensive Open Graph and Twitter Cards
- ✅ **Structured Data** - JSON-LD for WebApplication and Organization
- ✅ **Canonical URLs** - Duplicate content prevention
- ✅ **Mobile Optimization** - Responsive design throughout

### Production Status
- **Environment**: Production-ready
- **Database**: Supabase PostgreSQL with RLS enabled
- **Authentication**: Email/password with OAuth support
- **Security**: HTTPS enforced, API keys secured
- **Performance**: Lazy loading, code splitting, query caching

### Deployment

Deploy using the Lovable platform:
1. Click **Publish** button in the editor
2. Configure custom domain (optional)
3. Deploy to production

Or deploy manually to your preferred hosting:
- Vercel, Netlify, or similar static hosting
- Build command: `npm run build`
- Output directory: `dist`

---

## 🗺 Roadmap & Status

### ✅ Completed
- Core CRUD operations for stories and jobs
- OpenAI GPT-4 integration for analysis
- Practice session with flashcards
- Analytics and progress tracking
- Story groups and bookmarks
- Excel import/export
- Embeddable widget with QR codes

### 🚧 In Progress
- Enhanced security hardening
- Advanced RLS policy optimization
- Performance monitoring dashboard

### 🔮 Planned Features
- Mobile app (React Native)
- Video practice with recording
- Peer review and sharing
- Interview coach matching
- Company-specific story libraries
- Chrome extension for LinkedIn integration
- Multi-language support

### Known Limitations
- AI analysis requires OpenAI API key
- Excel import limited to specific format
- Practice sessions are single-player only

---

## 💬 Support & Community

### Getting Help
- 📧 **Email**: support@example.com (update with your contact)
- 💬 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 **Docs**: See documentation links above

### Reporting Issues
1. Check existing issues first
2. Provide clear reproduction steps
3. Include browser/OS information
4. Add screenshots if applicable

### Feature Requests
We love hearing your ideas! Open an issue with:
- Clear description of the feature
- Use case and benefit
- Any relevant examples or mockups

---

## 📄 License & Credits

### Built With
- **[Lovable](https://lovable.dev)** - AI-powered development platform
- **[Supabase](https://supabase.com)** - Open-source Firebase alternative
- **[OpenAI](https://openai.com)** - GPT-4 language models
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful component library

### Acknowledgments
- STAR method framework from behavioral interview best practices
- Community contributors and testers
- Open-source libraries and tools

### License
This project is for educational and professional development purposes.

---

## 🔗 Quick Links

- **Live Demo**: [View Production Site](https://lovable.dev/projects/94a25ac1-0cd4-43ac-8372-a831ff9954fc)
- **Documentation**: See links above
- **Supabase Dashboard**: [Project Dashboard](https://supabase.com/dashboard/project/pflisxkcxbzboxwidywf)
- **Built with Lovable**: [Learn More](https://lovable.dev)

---

<div align="center">
  <p><strong>Make me a STAR</strong> - Empowering job seekers with AI-driven interview preparation</p>
  <p>Built with ❤️ using Lovable, React, and Supabase</p>
</div>

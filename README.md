# AI-Powered Interview Assistant

A full-stack AI interview platform that conducts automated technical interviews for Full Stack (React/Node) positions. Built for the Swipe Internship Assignment.

🔗 **Live Demo**: https://ai-interview-assistant-j2pn.vercel.app/
📹 **Demo Video**: https://youtu.be/I2mifghliTM
💻 **GitHub**: https://github.com/AkashMV333-hub/AI-Interview-Assistant

## ✨ Features

### Interviewee Tab (Chat Interface)
- **Resume Upload**: Accepts PDF and DOCX files
- **Intelligent Parsing**: Automatically extracts Name, Email, and Phone from resumes using AI
- **Missing Field Collection**: Chatbot collects any missing information before starting
- **AI-Powered Questions**: Generates 6 dynamic questions (2 Easy, 2 Medium, 2 Hard)
- **Timed Responses**:
  - Easy: 20 seconds
  - Medium: 60 seconds
  - Hard: 120 seconds
- **Auto-Submit**: Automatically submits answers when time runs out
- **Real-time Evaluation**: AI scores each answer on a scale of 0-10
- **Final Summary**: AI-generated candidate performance summary

### Interviewer Tab (Dashboard)
- **Candidate List**: View all candidates ordered by score
- **Search & Filter**: Search by name, email, or phone; filter by status
- **Detailed View**: Access complete chat history, Q&A, and AI summary
- **Score Visualization**: Color-coded scores and status tags
- **Resume Download**: Download candidate resumes from dashboard

### Persistence & Session Management
- **Database Storage**: All candidate data persists in MongoDB
- **Session Restoration**: Resume interrupted interviews
- **Welcome Back Modal**: Prompts users to continue unfinished sessions
- **Authentication**: Secure login for both interviewers and candidates

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + redux-persist
- **UI Framework**: Ant Design
- **Routing**: React Router v7
- **File Parsing**: pdf-parse (PDF), mammoth (DOCX)
- **AI Integration**: OpenRouter API (supporting multiple AI models)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Security**: CORS, bcrypt password hashing
- **AI Integration**: OpenRouter API for AI-powered features

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📦 Installation

### Prerequisites
- Node.js 20.19+ or 22.12+
- MongoDB (local or Atlas)
- OpenRouter API key

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
OPENROUTER_API_KEY=your_openrouter_api_key
CORS_ORIGIN=http://localhost:5173
```

4. **Run the development server**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to root directory**
```bash
cd ..
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_ANTHROPIC_API_KEY=your_openrouter_api_key
VITE_API_BASE_URL=http://localhost:5000/api
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🎯 Usage

### For Candidates (Interviewee)

1. **Sign Up/Login**: Create an account or login as a candidate
2. **Join Interview Room**: Enter the room code provided by the interviewer
3. **Upload Resume**: Upload your resume (PDF or DOCX)
4. **Complete Profile**: If any information is missing, the chatbot will ask for it
5. **Take Interview**: Answer 6 questions within the given time limits
6. **View Results**: See your final score and AI-generated feedback

### For Interviewers

1. **Sign Up/Login**: Create an account or login as an interviewer
2. **Create Room**: Create an interview room and share the room code
3. **View Dashboard**: Access the dashboard to see all candidates in your room
4. **Search & Sort**: Use the search bar and table sorting features
5. **View Details**: Click "View Details" to see:
   - Candidate profile
   - All questions and answers with scores
   - Complete chat history
   - AI-generated summary
   - Download resume

## 📁 Project Structure

```
ai-interview-assistant/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js           # User authentication model
│   │   │   ├── Room.js           # Interview room model
│   │   │   └── Candidate.js      # Candidate data model
│   │   ├── routes/
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── rooms.js          # Room management routes
│   │   │   └── candidates.js     # Candidate data routes
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   └── server.js             # Express server setup
│   ├── .env
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx     # Main interview chat UI
│   │   ├── IntervieweeTab.tsx    # Candidate interview tab
│   │   ├── InterviewerTab.tsx    # Dashboard for interviewers
│   │   ├── ResumeUpload.tsx      # Resume upload component
│   │   ├── LoginInterviewer.tsx  # Interviewer login
│   │   ├── SignupInterviewer.tsx # Interviewer signup
│   │   └── WelcomeBackModal.tsx  # Session restoration modal
│   ├── store/
│   │   ├── slices/
│   │   │   ├── candidatesSlice.ts    # Candidate data
│   │   │   ├── interviewSlice.ts     # Interview state
│   │   │   ├── authSlice.ts          # Authentication state
│   │   │   └── interviewRoomsSlice.ts # Room management
│   │   ├── hooks.ts              # Typed Redux hooks
│   │   └── store.ts              # Redux store configuration
│   ├── services/
│   │   └── api.ts                # API client
│   ├── utils/
│   │   ├── aiService.ts          # AI integration
│   │   ├── resumeParser.ts       # PDF/DOCX parsing
│   │   └── jwtUtils.ts           # JWT token management
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── .env
└── package.json
```

## 🔑 Key Features Explained

### Resume Parsing
- Uses `pdf-parse` for PDF files and `mammoth` for DOCX files
- AI-powered extraction for Name, Email, and Phone
- Fallback to regex-based extraction if AI fails
- Handles various resume formats and layouts

### AI Integration
- **OpenRouter API**: Supports multiple AI models (GPT-4, Claude, etc.)
- **Question Generation**: Creates role-specific questions based on resume content
- **Answer Evaluation**: Scores answers with brief feedback
- **Summary Generation**: Provides comprehensive candidate assessment

### Authentication System
- JWT-based authentication with HTTP-only cookies
- Separate login flows for interviewers and candidates
- Protected routes with role-based access control
- Secure password hashing with bcrypt

### Timer System
- Real-time countdown with visual progress bar
- Auto-submit functionality when time expires
- Different time limits based on question difficulty
- Pause/resume support

### Data Persistence
- MongoDB for permanent storage
- Redux for client-side state management
- Selective persistence (interview state only, not large candidate data)
- Handles page refreshes and browser closes

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. **Set Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `OPENROUTER_API_KEY`
   - `CORS_ORIGIN=your_frontend_url`

### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Deploy via Vercel Dashboard**:
   - Import your GitHub repository
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**:
   - `VITE_ANTHROPIC_API_KEY=your_openrouter_api_key`
   - `VITE_API_BASE_URL=your_backend_url/api`

4. **Deploy**
```bash
vercel --prod
```

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `CORS_ORIGIN` | Allowed CORS origin URL | Yes |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ANTHROPIC_API_KEY` | OpenRouter API key | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

## 💡 Design Decisions

1. **Full-Stack Architecture**: Separated frontend and backend for scalability and security
2. **Database Storage**: MongoDB for persistent storage instead of localStorage
3. **AI Model Flexibility**: OpenRouter allows switching between different AI models
4. **JWT Authentication**: Secure, stateless authentication with HTTP-only cookies
5. **Selective Persistence**: Only persist interview state, fetch candidates from backend
6. **Room-based System**: Isolated interview rooms for multiple concurrent interviews
7. **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🧪 Testing

### Local Testing
1. Start MongoDB (or use MongoDB Atlas)
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `npm run dev`
4. Test flows:
   - Create interviewer account
   - Create interview room
   - Create candidate account
   - Join room and upload resume
   - Complete interview
   - View results in interviewer dashboard

### Test Cases
- ✅ Upload various resume formats (PDF, DOCX)
- ✅ Test with resumes missing different fields
- ✅ Complete full interview flow
- ✅ Verify timer functionality
- ✅ Check dashboard search and filter
- ✅ Test session persistence (refresh page mid-interview)
- ✅ Test authentication and authorization
- ✅ Test multiple concurrent interviews

## ✅ Assignment Requirements Checklist

- ✅ Two tabs: Interviewee and Interviewer (synced via backend)
- ✅ Resume upload (PDF required, DOCX supported)
- ✅ Extract Name, Email, Phone (AI-powered)
- ✅ Collect missing fields via chatbot
- ✅ AI-generated questions (6 total: 2E, 2M, 2H)
- ✅ Timed questions (20s, 60s, 120s)
- ✅ Auto-submit on timeout
- ✅ Interviewer dashboard with candidate list
- ✅ Search and sort functionality
- ✅ Detailed candidate view with chat history
- ✅ Data persistence (MongoDB)
- ✅ Welcome Back modal for session restoration
- ✅ Live deployment (Vercel + Render)
- ✅ Clean, responsive UI (Ant Design)

## 🐛 Known Issues & Limitations

1. **OpenRouter API Credits**: Requires valid API credits for AI features
2. **Large Resume Files**: Base64 encoding can cause storage issues
3. **Timer Precision**: May have minor delays in auto-submit
4. **Mobile UX**: Optimized for desktop, basic mobile support

## 🔮 Future Enhancements

- [ ] Video recording during interviews
- [ ] Multi-language support
- [ ] Custom question banks
- [ ] Analytics dashboard for interviewers
- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Multiple AI model selection
- [ ] Bulk candidate import

## 📄 License

MIT

## 👤 Author

Built as part of Swipe Internship Assignment

**Name**: Akash MV
**GitHub**: https://github.com/AkashMV333-hub
**Email**: mvakash283@gmail.com

---

**Note**: This application uses OpenRouter API for AI features. Ensure you have a valid API key and sufficient credits. Follow OpenRouter's usage policies.

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact via email

**Ready to relocate to Hyderabad for 6-month internship starting December 2024** ✅

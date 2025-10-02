# Quick Setup Guide

## Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm or yarn
- OpenAI API key

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste it into your `.env` file

### 3. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## Testing the Application

### As a Candidate (Interviewee)
1. Navigate to the **Interviewee** tab
2. Upload a PDF or DOCX resume
3. Fill in any missing information if prompted
4. Answer 6 interview questions within time limits:
   - Easy questions: 20 seconds
   - Medium questions: 60 seconds
   - Hard questions: 120 seconds
5. View your final score and AI feedback

### As an Interviewer
1. Navigate to the **Interviewer** tab
2. View all candidates sorted by score
3. Use search to filter candidates
4. Click "View Details" to see:
   - Candidate profile
   - All questions and answers
   - Individual scores
   - AI-generated summary
   - Complete chat history

## Features to Test

- ✅ Resume upload (PDF/DOCX)
- ✅ Automatic field extraction
- ✅ Missing field collection via chatbot
- ✅ Timed questions with auto-submit
- ✅ Real-time scoring
- ✅ Session persistence (try refreshing mid-interview)
- ✅ Welcome back modal for unfinished sessions
- ✅ Dashboard search and sort
- ✅ Detailed candidate view

## Deployment to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variable: `VITE_OPENAI_API_KEY`
4. Deploy

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run build
```
Fix any TypeScript errors shown

### Resume not parsing correctly
- Ensure PDF has selectable text (not scanned images)
- Try a different resume format
- Check console for error messages

### Timer not working
- Check if browser tab is active (timers pause in background tabs)
- Clear localStorage and try again

### AI questions not generating
- Verify OpenAI API key is correct
- Check API key has credits
- Fallback questions will be used if API fails

## Project Structure
```
src/
├── components/           # React components
├── store/               # Redux store and slices
├── utils/               # Utility functions (AI, parsing)
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Environment Variables
- `VITE_OPENAI_API_KEY`: Required for AI question generation and evaluation

## Notes
- All data is stored in browser localStorage
- Clearing browser data will reset all interviews
- Timer continues in background but displays may pause
- Large bundle size is due to PDF.js and Ant Design (normal for this type of app)

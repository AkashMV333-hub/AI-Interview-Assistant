// Using OpenRouter API which provides access to Claude and other models
const OPENROUTER_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface Question {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
}

const callOpenRouter = async (prompt: string, maxTokens: number = 1024): Promise<string> => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Interview Assistant',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Payment required or insufficient credits'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

export const generateQuestions = async (resumeText: string): Promise<Question[]> => {
  const prompt = `Based on the following resume, generate 6 technical interview questions for a Full Stack (React/Node) developer role.

Resume:
${resumeText}

Generate exactly 6 questions following this pattern:
- 2 Easy questions (20 seconds each)
- 2 Medium questions (60 seconds each)
- 2 Hard questions (120 seconds each)

Return the questions in JSON format as an array with this structure:
[
  {
    "question": "question text here",
    "difficulty": "Easy|Medium|Hard"
  }
]

Focus on React, Node.js, JavaScript, TypeScript, databases, and full-stack concepts. Make questions specific and practical.`;

  try {
    const content = await callOpenRouter(prompt, 1024);

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    const questionsData = JSON.parse(jsonString);

    const questions: Question[] = questionsData.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      question: q.question,
      difficulty: q.difficulty,
      timeLimit: q.difficulty === 'Easy' ? 20 : q.difficulty === 'Medium' ? 60 : 120,
    }));

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback questions if API fails
    return generateFallbackQuestions();
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  difficulty: string
): Promise<{ score: number; feedback: string }> => {
  const prompt = `Evaluate this interview answer on a scale of 0-10.

Question (${difficulty}): ${question}
Answer: ${answer}

Provide a JSON response with:
{
  "score": <number 0-10>,
  "feedback": "<brief feedback in one sentence>"
}`;

  try {
    const content = await callOpenRouter(prompt, 256);

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{"score": 5, "feedback": "Answer received."}';
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    // Fallback scoring based on answer length and content
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 5;
    if (wordCount === 0) score = 0;
    else if (wordCount < 5) score = 3;
    else if (wordCount < 20) score = 5;
    else if (wordCount < 50) score = 7;
    else score = 8;

    return {
      score,
      feedback: 'Answer recorded. AI evaluation unavailable - using fallback scoring.'
    };
  }
};

export const generateSummary = async (
  candidateName: string,
  questionsAnswers: Array<{ question: string; answer: string; score: number; difficulty: string }>
): Promise<string> => {
  const qaText = questionsAnswers
    .map(
      (qa, i) =>
        `Q${i + 1} (${qa.difficulty}): ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}/10`
    )
    .join('\n\n');

  const prompt = `Create a brief interview summary (2-3 sentences) for candidate ${candidateName} based on their performance:

${qaText}

Provide a concise professional summary of their strengths and areas for improvement.`;

  try {
    return await callOpenRouter(prompt, 256);
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Interview completed. Unable to generate detailed summary.';
  }
};

export const generateProfileDescription = async (resumeText: string): Promise<string> => {
  const prompt = `Based on the following resume text, create a concise professional profile description (2-4 sentences) highlighting the candidate's key skills, experience, and expertise. Focus on their technical background and qualifications.

Resume:
${resumeText}

Provide only the profile description without any additional commentary.`;

  try {
    return await callOpenRouter(prompt, 512);
  } catch (error) {
    console.error('Error generating profile description:', error);
    return 'Experienced professional with relevant technical skills.';
  }
};

// Fallback questions if AI API fails
const generateFallbackQuestions = (): Question[] => [
  {
    id: 'q-fallback-1',
    question: 'What is the difference between let, const, and var in JavaScript?',
    difficulty: 'Easy',
    timeLimit: 20,
  },
  {
    id: 'q-fallback-2',
    question: 'Explain what React hooks are and name three commonly used hooks.',
    difficulty: 'Easy',
    timeLimit: 20,
  },
  {
    id: 'q-fallback-3',
    question: 'How does async/await work in JavaScript? Provide an example.',
    difficulty: 'Medium',
    timeLimit: 60,
  },
  {
    id: 'q-fallback-4',
    question: 'What is middleware in Express.js and how would you use it?',
    difficulty: 'Medium',
    timeLimit: 60,
  },
  {
    id: 'q-fallback-5',
    question: 'Explain the concept of Virtual DOM in React and how it improves performance.',
    difficulty: 'Hard',
    timeLimit: 120,
  },
  {
    id: 'q-fallback-6',
    question: 'Design a simple REST API for a blog application. What endpoints would you create and why?',
    difficulty: 'Hard',
    timeLimit: 120,
  },
];

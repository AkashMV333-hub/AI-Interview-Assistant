const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['user', 'bot', 'system'],
  },
  content: String,
  timestamp: Number,
});

const questionAnswerSchema = new mongoose.Schema({
  questionId: String,
  question: String,
  answer: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  timeLimit: Number,
  timeSpent: Number,
  score: Number,
});

const resumeFileSchema = new mongoose.Schema({
  name: String,
  type: String,
  data: String, // Base64 encoded
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  roomCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  resumeText: String,
  resumeFile: resumeFileSchema,
  profileDescription: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  chatHistory: [messageSchema],
  questionsAnswers: [questionAnswerSchema],
  finalScore: {
    type: Number,
    default: 0,
  },
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
candidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);

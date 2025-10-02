const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const authMiddleware = require('../middleware/auth');

// POST /api/candidates - Create new candidate
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      id,
      roomCode,
      name,
      email,
      phone,
      resumeText,
      resumeFile,
      profileDescription,
    } = req.body;

    const candidate = new Candidate({
      id,
      userId: req.user.userId,
      roomCode,
      name,
      email,
      phone,
      resumeText,
      resumeFile,
      profileDescription,
      status: 'pending',
      chatHistory: [],
      questionsAnswers: [],
      finalScore: 0,
      summary: '',
    });

    await candidate.save();

    res.status(201).json({
      message: 'Candidate created successfully',
      candidate,
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ message: 'Error creating candidate' });
  }
});

// GET /api/candidates/room/:roomCode - Get all candidates for a room
router.get('/room/:roomCode', authMiddleware, async (req, res) => {
  try {
    const candidates = await Candidate.find({ roomCode: req.params.roomCode.toUpperCase() });
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Error fetching candidates' });
  }
});

// GET /api/candidates/:id - Get single candidate by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ message: 'Error fetching candidate' });
  }
});

// PATCH /api/candidates/:id - Update candidate data
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const {
      status,
      chatHistory,
      questionsAnswers,
      finalScore,
      summary,
      profileDescription,
    } = req.body;

    if (status !== undefined) candidate.status = status;
    if (chatHistory !== undefined) candidate.chatHistory = chatHistory;
    if (questionsAnswers !== undefined) candidate.questionsAnswers = questionsAnswers;
    if (finalScore !== undefined) candidate.finalScore = finalScore;
    if (summary !== undefined) candidate.summary = summary;
    if (profileDescription !== undefined) candidate.profileDescription = profileDescription;

    await candidate.save();

    res.json({
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ message: 'Error updating candidate' });
  }
});

// POST /api/candidates/:id/chat - Add message to chat history
router.post('/:id/chat', authMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const { message } = req.body;
    candidate.chatHistory.push(message);
    await candidate.save();

    res.json({
      message: 'Chat message added successfully',
      candidate,
    });
  } catch (error) {
    console.error('Add chat message error:', error);
    res.status(500).json({ message: 'Error adding chat message' });
  }
});

// POST /api/candidates/:id/answer - Add question answer
router.post('/:id/answer', authMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const { questionAnswer } = req.body;
    candidate.questionsAnswers.push(questionAnswer);
    await candidate.save();

    res.json({
      message: 'Question answer added successfully',
      candidate,
    });
  } catch (error) {
    console.error('Add question answer error:', error);
    res.status(500).json({ message: 'Error adding question answer' });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndDelete({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ message: 'Error deleting candidate' });
  }
});

module.exports = router;

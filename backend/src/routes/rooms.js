const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const InterviewRoom = require('../models/InterviewRoom');
const authMiddleware = require('../middleware/auth');

// UUID v4 generator using crypto (alternative to uuid package)
const uuidv4 = () => {
  return crypto.randomUUID();
};

// Generate room code
const generateRoomCode = () => {
  return `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// POST /api/rooms - Create new room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId;

    // Get user name from database
    const User = require('../models/User');
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roomCode = generateRoomCode();
    const room = new InterviewRoom({
      roomId: uuidv4(),
      roomCode,
      interviewerId: userId,
      interviewerName: user.name,
      title,
      candidateIds: [],
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Error creating room' });
  }
});

// GET /api/rooms - Get all rooms for current interviewer
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await InterviewRoom.find({ interviewerId: req.user.userId });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// GET /api/rooms/:roomCode - Get room by code
router.get('/:roomCode', async (req, res) => {
  try {
    const room = await InterviewRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Error fetching room' });
  }
});

// POST /api/rooms/:roomCode/join - Join a room
router.post('/:roomCode/join', authMiddleware, async (req, res) => {
  try {
    const room = await InterviewRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Invalid room code' });
    }

    if (!room.candidateIds.includes(req.user.userId)) {
      room.candidateIds.push(req.user.userId);
      await room.save();
    }

    res.json({
      message: 'Joined room successfully',
      room,
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Error joining room' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const interviewRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  interviewerId: {
    type: String,
    required: true,
  },
  interviewerName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  candidateIds: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewRoom', interviewRoomSchema);

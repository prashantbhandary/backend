const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mentorship', 'workshop', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  duration: String,
  students: String,
  participants: Number,
  rating: Number,
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  topics: [String],
  outcomes: [String],
  location: String,
  date: String,
  year: String,
  achievement: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isPublished: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Experience', experienceSchema);

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['IoT', 'Robotics', 'Embedded', 'Power Electronics', 'Communication', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  technologies: [String],
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Planned'],
    default: 'In Progress'
  },
  githubUrl: String,
  demoUrl: String,
  imageUrl: String,
  featured: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Project', projectSchema);

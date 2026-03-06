const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isPublished: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    if (featured) {
      query.featured = featured === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ publishedAt: -1 });
    
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/blogs/slug/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Creating blog with data:', req.body);
    const blog = new Blog(req.body);
    await blog.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('blog:created', blog);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('blog:updated', blog);

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('blog:deleted', { id: req.params.id });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;

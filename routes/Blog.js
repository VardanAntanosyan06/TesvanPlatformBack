const express = require("express");
const router = express.Router();
const blogController = require('../controlers/BlogController');

// Routes for careers
router.post('/', blogController.createBlog);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
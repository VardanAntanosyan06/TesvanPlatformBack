const { Blog } = require('../models');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const allowedFormats = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',              // PDF files
    'application/msword',           // .doc files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
    'application/vnd.ms-excel',     // .xls files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
    'application/json', //.json files
    'text/plain',
    "application/xml"
  ];

// Create a new blog
const createBlog = async (req, res) => {
    try {
        const { title_en, title_am, title_ru, description_en, description_am, description_ru } = req.body;
        const { file } = req.files;

        if (!allowedFormats.includes(file.mimetype)) {
            return res.status(400).json({ success: false, message: 'Unsupported file format' });
        };

        const type = file.mimetype.split('/')[1];
        const fileName = uuid.v4() + '.' + type;
        await file.mv(path.resolve(__dirname, '../', 'static', fileName));

        const newBlog = await Blog.create({ title_en, title_am, title_ru, description_en, description_am, description_ru, img: fileName });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};

// Get all blogs with optional language filter
const getBlogs = async (req, res) => {
    try {
        const { language } = req.query;
        const blogs = await Blog.findAll({
            attributes: [[`title_${language}`, "title"], [`description_${language}`, "description"], "img"]
        });

        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error: error.message });
    }
};

// Get a single blog by ID with optional language filter
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.query;

        const blog = await Blog.findOne({
            where: { id },
            attributes: [[`title_${language}`, "title"], [`description_${language}`, "description"], "img"]
        });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog", error: error.message });
    }
};

// Update a blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title_en, title_am, title_ru, description_en, description_am, description_ru } = req.body;

        const blog = await Blog.findByPk(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        let fileName
        if(req.files.file){
            const { file } = req.files;

            if (!allowedFormats.includes(file.mimetype)) {
                return res.status(400).json({ success: false, message: 'Unsupported file format' });
            };

            fs.unlinkSync(path.resolve(__dirname, "../", "static", blog.img));
    
            const type = file.mimetype.split('/')[1];
            fileName = uuid.v4() + '.' + type;
            await file.mv(path.resolve(__dirname, '../', 'static', fileName));
        } else {
            fileName = blog.img
        };

        await Blog.update(
            { title_en, title_am, title_ru, description_en, description_am, description_ru, img: fileName },
            { where: { id } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error updating blog", error: error.message });
    }
};

// Delete a blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByPk(id);
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        };

        await Blog.destroy({ where: { id } });

        fs.unlinkSync(path.resolve(__dirname, "../", "static", blog.img));

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error deleting blog", error: error.message });
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};


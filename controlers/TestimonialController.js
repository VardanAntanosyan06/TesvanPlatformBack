const { Testimonial } = require('../models');
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
const createTestimonial = async (req, res) => {
    try {
        const { fullName_en, fullName_am, fullName_ru, staff, testimonial_en, testimonial_am, testimonial_ru } = req.body;
        const { file } = req.files;

        if (!allowedFormats.includes(file.mimetype)) {
            return res.status(400).json({ success: false, message: 'Unsupported file format' });
        };

        const type = file.mimetype.split('/')[1];
        const fileName = uuid.v4() + '.' + type;
        await file.mv(path.resolve(__dirname, '../', 'static', fileName));

        const newBlog = await Testimonial.create({ fullName_en, fullName_am, fullName_ru, staff, testimonial_en, testimonial_am, testimonial_ru, img: fileName });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error creating testimonial", error: error.message });
    }
};

// Get all blogs with optional language filter
const getTestimonials = async (req, res) => {
    try {
        const { language } = req.query;
        const testimonials = await Testimonial.findAll({
            attributes: [[`fullName_${language}`, "fullName"], [`testimonial_${language}`, "testimonial"], "staff", "img"]
        });

        res.status(200).json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ message: "Error fetching testimonials", error: error.message });
    }
};

// Get a single blog by ID with optional language filter
const getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.query;

        const testimonial = await Testimonial.findOne({
            where: { id },
            attributes: [[`fullName_${language}`, "fullName"], [`testimonial_${language}`, "testimonial"], "staff", "img"]
        });

        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        res.status(200).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ message: "Error fetching testimonial", error: error.message });
    }
};

// Update a blog
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName_en, fullName_am, fullName_ru, staff, testimonial_en, testimonial_am, testimonial_ru } = req.body;

        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        let fileName
        if (req.files.file) {
            const { file } = req.files;

            if (!allowedFormats.includes(file.mimetype)) {
                return res.status(400).json({ success: false, message: 'Unsupported file format' });
            };

            fs.unlinkSync(path.resolve(__dirname, "../", "static", testimonial.img));

            const type = file.mimetype.split('/')[1];
            fileName = uuid.v4() + '.' + type;
            await file.mv(path.resolve(__dirname, '../', 'static', fileName));
        } else {
            fileName = testimonial.img
        };

        await Testimonial.update(
            { fullName_en, fullName_am, fullName_ru, staff, testimonial_en, testimonial_am, testimonial_ru, img: fileName },
            { where: { id } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error updating testimonial", error: error.message });
    }
};

// Delete a blog
const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        };

        await Testimonial.destroy({ where: { id } });

        fs.unlinkSync(path.resolve(__dirname, "../", "static", testimonial.img));

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error deleting testimonial", error: error.message });
    }
};

module.exports = {
    createTestimonial,
    getTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial
};
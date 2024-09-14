const { Video } = require('../models');
// const express = require('express');
// app.use(express.raw({ type: 'video/*', limit: '50mb' }));
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

const allowedFormats = [
    "video/mp4",
    "video/mpeg"
];

const createVideo = async (req, res) => {
    try {
        const { title_am, title_en, title_ru, description_am, description_en, description_ru } = req.body;
        const { file } = req.files;
        const { lessonId } = req.params

        if (!req.files.file || !req.body.title_am || !req.body.title_en || !req.body.title_ru) {
            return res.status(400).json({ success: false, message: 'No video uploaded or no title.' });
        };

        if (!allowedFormats.includes(file.mimetype)) {
            return res.status(400).json({ success: false, message: 'Unsupported file format' });
        };

        const type = file.mimetype.split('/')[1];
        const videoFilename = uuid.v4() + '.' + type;
        await file.mv(path.resolve(__dirname, '../', 'static', videoFilename));

        const video = await Video.create({
            lessonId,
            url: videoFilename,
            title_am,
            title_en,
            title_ru,
            description_am,
            description_en,
            description_ru
        });

        return res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            video
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    };
};

const getVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findOne({
            where: {
                id
            },
            attributes: {
                exclude: ['lessonId']
            },
        });

        return res.status(200).json({
            success: true,
            video
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    };
};

const getVideos = async (req, res) => {
    try {
        const videos = await Video.findAll({
            attributes: {
                exclude: ['lessonId']
            }
        });

        return res.status(200).json({
            success: true,
            videos
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    };
};

const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title_am, title_en, title_ru, description_am, description_en, description_ru } = req.body;

        if (!title_am || !title_en || !title_ru) {
            return res.status(400).json({ success: false, message: "Bad request" });
        };

        const [affectedCount] = await Video.update(
            {
                title_am,
                title_en,
                title_ru,
                description_am,
                description_en,
                description_ru
            },
            {
                where: {
                    id
                }
            }
        );

        if (affectedCount === 0) {
            return res.status(500).json({ success: false, message: 'Video do not updated.' });
        };

        return res.status(200).json({
            success: true,
            message: "Video updated"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    };
};

const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const { url } = await Video.findOne({
            where: {
                id
            }
        });

        fs.unlinkSync(path.resolve(__dirname, "../", "static", url));

        const deleteVideo = await Video.destroy({
            where: {
                id
            }
        });

        if (deleteVideo === 0) {
            return res.status(500).json({ success: false, message: 'Video do not deleted.' });
        };

        return res.status(200).json({
            success: true,
            message: "Video delated"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    };
};

module.exports = {
    createVideo,
    getVideo,
    getVideos,
    updateVideo,
    deleteVideo
};
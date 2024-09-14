const express = require('express');
const router = express.Router();
const controller = require('../controlers/VideoController');
const checkAuth = require('../middleware/checkAuth');

router.post('/:lessonId', checkAuth(['ADMIN']), controller.createVideo);
router.get('/', checkAuth(['ADMIN']), controller.getVideos);
router.get('/:id', checkAuth(['ADMIN']), controller.getVideo);
router.put('/:id', checkAuth(['ADMIN']), controller.updateVideo);
router.delete('/:id', checkAuth(['ADMIN']), controller.deleteVideo);

module.exports = router;
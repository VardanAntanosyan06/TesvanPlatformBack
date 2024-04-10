var express = require('express');
var router = express.Router();

const controller = require('../controlers/SkillsController');
const checkAuth = require('../middleware/checkAuth');

router.post('/addSkills', checkAuth(['TEACHER', 'ADMIN']), controller.addSkills);
router.get('/getSkills/:id', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), controller.getUserSkilles);
router.patch('/updateSkills', checkAuth(['TEACHER', 'ADMIN']), controller.updateUserSkilles);
router.delete('/deleteSkills', checkAuth(['TEACHER', 'ADMIN']), controller.destroyUserSkill);

module.exports = router;

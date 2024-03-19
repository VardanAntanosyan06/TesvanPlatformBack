var express = require('express');
var router = express.Router();

const controller = require('../controlers/RegisterController');

router.post('/', controller.UserRegistartion);
router.get('/emailExist/:email', controller.EmailExist);
router.get('/sendEmail', controller.UserRegistartionSendEmail);
router.patch('/verification', controller.UserRegistartionVerification);
router.post('/addUser', controller.AddMember);
router.get('/getMembers', controller.getMembers);
router.patch('/editMembers/:id', controller.editMember);
router.delete('/deleteMembers/:id', controller.deleteMembers);

module.exports = router;

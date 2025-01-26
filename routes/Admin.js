const express = require("express");
const router = express.Router();

const controller = require("../controlers/AdminController");
const checkAuth = require("../middleware/checkAuth");

router.post('/', checkAuth(['SUPERADMIN']), controller.createAdmin);
router.get('/', checkAuth(['SUPERADMIN']), controller.getAdmins);
router.get('/:id', checkAuth(['SUPERADMIN']), controller.getAdmin);
router.patch('/:id', checkAuth(['SUPERADMIN']), controller.updateAdmin);
router.delete('/:id', checkAuth(['SUPERADMIN']), controller.deleteAdmin);

module.exports = router;
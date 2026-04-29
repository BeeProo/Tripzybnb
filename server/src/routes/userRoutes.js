const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

module.exports = router;

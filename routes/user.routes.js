const express = require('express');
const {createUserProfile, updateUserProfile, deleteUserProfile, deactivateUserProfile, activateUserProfile,
    getUsers, getUser
} = require('../controllers/user.controller');
const {authMiddleware} = require("../middlewares/auth.middleware");
const {getRoles} = require("../controllers/role.controller");
const router = express.Router();

router.post('/', authMiddleware, createUserProfile);
router.put('/:userId', authMiddleware, updateUserProfile);
router.delete('/:userId', authMiddleware, deactivateUserProfile);
router.get('/activate/:userId', authMiddleware, activateUserProfile);
router.get('/', authMiddleware, getUsers);
router.get('/get-user/:userId', authMiddleware, getUser);

module.exports = router;
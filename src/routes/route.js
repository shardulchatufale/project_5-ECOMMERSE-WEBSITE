const express = require('express');
const { createUser, loginUser, getUser, updateUser } = require('../controllers/userController');
const { authentication, authorization } = require('../middleWare/auth');


const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUser);
router.put('/user/:userId/profile', updateUser)

module.exports = router;
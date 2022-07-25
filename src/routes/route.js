const express = require('express');
const controllers = require('../controllers/userController');

const router = express.Router(); 

router.post("/register", controllers.createUser)

module.exports = router;
const express = require('express');
const { userLogin, registerUser } = require('../controller/user.controller');
const router = express.Router();
// router.post('/register', registerUser);
// router.get('/login', userLogin);

router.post('/', registerUser);
router.get('/user', userLogin);

module.exports = router;

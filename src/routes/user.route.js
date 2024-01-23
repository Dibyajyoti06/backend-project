const express = require('express');
const { userLogin, showSomething } = require('../controller/user.controller');
const router = express.Router();
// router.post('/register', registerUser);
// router.get('/login', userLogin);

router.get('/', showSomething);
router.get('/user', userLogin);

module.exports = router;

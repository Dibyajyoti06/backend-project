const express = require('express');
const { registerUser, userLogin } = require('../controller/user.controller');
const route = express.route();

route.post('/register', registerUser);
route.get('/login', userLogin);

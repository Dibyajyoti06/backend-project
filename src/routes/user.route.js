const express = require('express');
const { userLogin, registerUser } = require('../controller/user.controller');
const router = express.Router();
const upload = require('../utils/cloudinary');
// router.post('/register', registerUser);
// router.get('/login', userLogin);

router.post(
  '/register',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);
router.get('/user', userLogin);

module.exports = router;

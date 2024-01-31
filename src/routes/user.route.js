const express = require('express');
const {
  userLogin,
  registerUser,
  logoutUser,
} = require('../controller/user.controller');
const router = express.Router();
const { upload } = require('../middleware/multer.middleware');
const verifyJWT = require('../middleware/auth.middleware');
// router.post('/register', registerUser);
// router.get('/login', userLogin);

router.post(
  '/register',
  upload.fields([
    { name: 'Avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);
router.post('/login', userLogin);
router.post('/logout', verifyJWT, logoutUser);

module.exports = router;

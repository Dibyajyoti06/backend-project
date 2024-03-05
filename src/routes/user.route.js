const express = require('express');
const {
  userLogin,
  registerUser,
  logoutUser,
  RefreshAccessToken,
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
router.get('/logout', verifyJWT, logoutUser);
router.get('/refresh-token', RefreshAccessToken);
router.module.exports = router;

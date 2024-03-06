const express = require('express');
const {
  userLogin,
  registerUser,
  logoutUser,
  RefreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
  getUserChannelProfile,
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
router.post('/change-password', verifyJWT, changePassword);
router.get('/logout', verifyJWT, logoutUser);
router.get('/refresh-token', RefreshAccessToken);
router.get('/current-user', verifyJWT, getCurrentUser);
router.get('/channel/:username', verifyJWT, getUserChannelProfile);
router.get('/history', verifyJWT, getWatchHistory);
router.patch('/update-account', verifyJWT, updateAccountDetails);
router.patch('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar);
router.patch(
  '/coverImage',
  verifyJWTupload.single('coverImage'),
  updateUserCoverImage
);

router.module.exports = router;

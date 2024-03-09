const Router = require('express');
const {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} = require('../controller/video.controller.js');
const verifyJWT = require('../middleware/auth.middleware.js');
const upload = require('../middleware/multer.middleware.js');

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route('/')
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: 'videoFile',
        maxCount: 1,
      },
      {
        name: 'thumbnail',
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route('/:videoId')
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single('thumbnail'), updateVideo);

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

module.exports = router;

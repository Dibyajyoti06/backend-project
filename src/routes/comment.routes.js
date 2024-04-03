const express = require('express');
const {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} = require('../controller/comment.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/:videoId').get(getVideoComments).post(addComment);
router.route('/c/:commentId').delete(deleteComment).patch(updateComment);

module.exports = router;

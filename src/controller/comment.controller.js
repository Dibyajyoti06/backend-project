const mongoose = require('mongoose');
const Comment = require('../model/comment.controller.js');
const Like = require('../model/like.model.js');

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const content = req.body;
  const videoId = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  if (!content || content.trim() === '') {
    res.status(400).json({
      msg: 'commentField is required',
    });
  }

  const createdComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!createdComment) {
    res.status(500).json({
      msg: 'Something went wrong while adding comment',
    });
  }

  return res.status(200).json({
    createdComment,
    msg: 'Comment added successfully',
  });
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    res.status(400).json({
      msg: 'Invalid comment Id',
    });
  }

  const { content } = req.body;

  if (!content || content.trim() === '') {
    res.status(400).json({
      msg: 'commentField is required',
    });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    res.status(400).json({
      msg: 'Comment not found!',
    });
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: 'only comment owner can edit their comment',
    });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    comment?._id,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updateComment) {
    res.status(500).json({
      msg: 'Failed to edit comment please try again',
    });
  }

  return res.status(200).json({
    updatedComment,
    msg: 'Comment edited successfully',
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(400).json({
      msg: 'Comment not found',
    });
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: 'only comment owner can delete their comment',
    });
  }

  await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: commentId,
    likedBy: req.user,
  });

  return res.status(200).json({
    videoId,
    msg: 'Comment deleted successfully',
  });
});

export { getVideoComments, addComment, updateComment, deleteComment };

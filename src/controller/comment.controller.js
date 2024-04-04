const mongoose = require('mongoose');
const Comment = require('../model/comment.controller.js');
const Like = require('../model/like.model.js');
const Video = require('../model/video.model.js');

const getVideoComments = async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }
  const video = await Video.findById(videoId);

  if (!video) {
    res.status(400).json({
      msg: 'Video not found...',
    });
  }
  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'likes',
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: '$likes',
        },
        owner: {
          $first: '$owner',
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, '$likes.likedBy'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          avatar: 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res.status(200).json({
    comments: comments.docs[0],
    msg: 'Comments fetched successfully',
  });
};

const addComment = async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

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
};

const updateComment = async (req, res) => {
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
};

const deleteComment = async (req, res) => {
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
  });

  return res.status(200).json({
    msg: 'Comment deleted successfully',
  });
};

module.exports = { getVideoComments, addComment, updateComment, deleteComment };

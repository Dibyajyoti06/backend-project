const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: 'String',
      required: [true, 'content is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  { timestamps: true }
);

commentSchema.plugin(aggregatePaginate);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

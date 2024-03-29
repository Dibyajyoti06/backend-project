const { default: mongoose, Schema } = require('mongoose');

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: 'String',
      required: [true, 'content is required'],
    },
  },
  { timestamps: true }
);

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;

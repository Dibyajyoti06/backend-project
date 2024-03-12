const mongoose = require('mongoose');
const Subscription = require('../model/subscription.model');

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    res.status(400).json({
      msg: 'Invalid channelId!',
    });
  }

  const subscribers = Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscribers',
        foreignField: '_id',
        as: 'subscriber',
        pipeline: [
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'channel',
              as: 'subscribedToSubscriber',
            },
          },
          {
            $addFields: {
              subs,
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json({
    subscribers,
    msg: 'Subscribers fetched successfully...',
  });
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField: '_id',
        as: 'subscribedChannel',
        pipeline: [
          {
            $lookup: {},
          },
        ],
      },
    },
  ]);

  return res.status(200).json({
    subscribedChannel,
    msg: 'subscribed channel fetched successfully...',
  });
});

module.exports = {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};

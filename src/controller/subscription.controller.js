const mongoose = require('mongoose');
const Subscription = require('../model/subscription.model');

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!mongoose.isValidObjectId(channelId)) {
    res.status(400).json({
      msg: 'Invalid channelId!',
    });
  }
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);
    res.status(200).json({
      subscribed: false,
      msg: 'unsubscribed successfully',
    });
  }

  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });
  res.status(200).json({
    subscribed: true,
    msg: 'subscribed successfully...',
  });
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
              as: 'subscribedTo',
            },
          },
          {
            $addFields: {
              subscribedTo: {
                $cond: {
                  if: {
                    $in: [channelId, '$subscibedTo.subscriber'],
                  },
                  then: true,
                  else: false,
                },
              },
              subscriberCount: {
                $size: '$subscriber',
              },
            },
          },
        ],
      },
    },
    {
      $unwind: '$subscriber',
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          subscribedTo: 1,
          subscribersCount: 1,
        },
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
            $lookup: {
              from: 'videos',
              localField: '_id',
              foreignField: 'owner',
              as: 'videos',
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: '$videos',
              },
            },
          },
        ],
      },
    },
    {
      $unwind: '$subscribedChannel',
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          subscribedToSubscriber: 1,
          subscribersCount: 1,
        },
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

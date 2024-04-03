const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

const userRouter = require('../src/routes/user.route');
const healthcheckRouter = require('../src/routes/healthcheck.routes');
const dashboardRouter = require('../src/routes/dashboard.routes');
const likeRouter = require('../src/routes/like.routes');
const playlistRouter = require('../src/routes/playlist.routes');
const subscriptionRouter = require('../src/routes/subscription.routes');
const tweetRouter = require('../src/routes/tweet.routes');
const videoRouter = require('../src/routes/video.routes');
const commentRouter = require('../src/routes/comment.routes');

app.use('/user', userRouter);
app.use('/healthcheck', healthcheckRouter);
app.use('/subscription', subscriptionRouter);
app.use('/videos', videoRouter);
app.use('/comments', commentRouter);
app.use('/likes', likeRouter);
app.use('/playlist', playlistRouter);
app.use('/dashboard', dashboardRouter);
app.use('/tweet', tweetRouter);

module.exports = app;

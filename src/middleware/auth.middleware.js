const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');
    if (!token) res.status(401).json({ error: 'Unauthorized request' });
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );
    if (!user) res.status(401).json({ error: 'Invalid Access Token' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error?.message || 'Invalid Access Token' });
  }
};

module.exports = verifyJWT;

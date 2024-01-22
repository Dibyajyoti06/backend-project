const registerUser = async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists:username or email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entry in db
  // remove password and refresh token field from response
  //check for user creation
  //return res
};

function userLogin(req, res) {
  res.json({
    msg: 'Hello from backend Project',
  });
}
module.exports = { userSignup, userLogin };

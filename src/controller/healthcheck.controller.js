const healthcheck = async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message

  return res.status(200).json({
    message: 'Everything is OK!',
  });
};

module.exports = healthcheck;

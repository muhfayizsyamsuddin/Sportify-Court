const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

//! authentication = untuk identify user/verifikasi(dia itu siapa?)
module.exports = async function authentication(req, res, next) {
  //! Extract token: Get Bearer token from authorization header
  // console.log("Headers:", req.headers);
  const bearerToken = req.headers.authorization;
  // console.log("🔐 Authorization Header:", bearerToken);
  if (!bearerToken) {
    next({ name: "Unauthorized", message: "Invalid token" }); //401
    return;
  }
  const access_token = bearerToken.split(" ")[1];

  try {
    //! Verify token
    const data = verifyToken(access_token);

    const user = await User.findByPk(data.id);

    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" }; //401
    }
    //! Attach user
    req.user = user;
    //! continue: call next() to proceed
    next();
  } catch (err) {
    next(err);
  }
};

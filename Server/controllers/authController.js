const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = class authController {
  static async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const newUser = await User.create(req.body);
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" }; // 400
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw { name: "BadRequest", message: "Invalid email format" }; // 400
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" }; // 400
      }
      if (password.length < 6) {
        throw {
          name: "BadRequest",
          message: "Password must be at least 6 characters long",
        };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const accessToken = signToken({ id: user.id, role: user.role });
      res.status(200).json({
        message: "Login Success",
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    const { id_token } = req.body;
    try {
      if (!id_token) {
        throw { name: "BadRequest", message: "id_token is required" }; // 400
      }
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { name, email } = ticket.getPayload();
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: Math.random().toString(36).slice(-8),
          role: "user",
        });
      }
      const access_token = signToken({ id: user.id, role: user.role });
      res.status(200).json({
        message: "Google Login Success",
        access_token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
};

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { authenticateToken } = require("../middleware/jwt.middleware");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });
  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" },
  );
  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration has been Successful",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      error: true,
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: true,
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { algorithm: "HS256", expiresIn: "24h" },
  );

  return res.status(200).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Login successful",
  });
});

router.get("/verify", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  const isUser = await User.findOne({ _id: userId });

  if (!isUser) {
    return res.status(401).json({
      error: true,
      message: "User not found",
    });
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
    },
    message: "User retrieved successfully",
  });
});

module.exports = router;

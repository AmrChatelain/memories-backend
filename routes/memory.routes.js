const express = require("express");
const router = express.Router();
const Memory = require("../models/Memory.model");
const { authenticateToken } = require("../middleware/jwt.middleware");




module.exports = router;
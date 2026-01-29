const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag.model");
const { authenticateToken } = require("../middleware/jwt.middleware");

// CREATE TAG
router.post("/", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const { userId } = req.user;

  if (!name) {
    return res.status(400).json({
      error: true,
      message: "Tag name is required",
    });
  }

  try {
    // Check if tag with this name already exists for this user
    const existingTag = await Tag.findOne({ name, userId });

    if (existingTag) {
      return res.status(400).json({
        error: true,
        message: "Tag already exists",
      });
    }

    const tag = new Tag({
      name,
      userId,
    });

    await tag.save();

    res.status(201).json({
      error: false,
      tag: tag,
      message: "Tag created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

// GET ALL TAGS
router.get("/", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Get userId from JWT token

  try {
    // Find all tags that belong to this user
    const tags = await Tag.find({ userId }).sort({ createdOn: -1 });

    res.status(200).json({
      error: false,
      tags: tags,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

// DELETE TAG
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const tag = await Tag.findOne({ _id: id, userId });

    if (!tag) {
      return res.status(404).json({
        error: true,
        message: "Tag not found",
      });
    }

    await Tag.deleteOne({ _id: id, userId });

    res.status(200).json({
      error: false,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;

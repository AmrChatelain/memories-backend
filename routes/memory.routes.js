const express = require("express");
const router = express.Router();
const Memory = require("../models/Memory.model");
const { authenticateToken } = require("../middleware/jwt.middleware");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");

//Add Memory
router.post("/memory", authenticateToken, async (req, res) => {
  const { title, story, imageUrl, location, visitedDate, tags } = req.body;
  const { userId } = req.user;

  if (!title || !story || !location || !imageUrl) {
    return res.status(400).json({
      error: true,
      message: "All fields are required",
    });
  }

  try {
    const memory = new Memory({
      title,
      story,
      imageUrl,
      location,
      visitedDate,
      userId,
      tags: tags || [],
    });

    await memory.save();

    res.status(201).json({
      error: false,
      memory: memory,
      message: "Added Successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});

//Get All Memories
router.get("/all-memories", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const memories = await Memory.find({ userId: userId })
      .populate("tags")
      .sort({ isFavorite: -1 });
      
    res.status(200).json({ memories: memories });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

//Upload Image to Cloudinary
router.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: "No image has been uploaded",
      });
    }

    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "memories",
    });

    res.status(201).json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Delete Memory
router.delete("/memory/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const memory = await Memory.findOne({ _id: id, userId });

    if (!memory) {
      return res.status(404).json({
        error: true,
        message: "Memory not found",
      });
    }

    // Extract public_id and delete from Cloudinary
    const urlParts = memory.imageUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete memory from database
    await Memory.deleteOne({ _id: id, userId });

    res.status(200).json({
      error: false,
      message: "Memory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Edit Memory
router.put("/memory/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedDate, imageUrl, location, tags } = req.body;
  const { userId } = req.user;

  if (!title || !story || !location || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const memory = await Memory.findOne({ _id: id, userId: userId });

    if (!memory) {
      return res
        .status(404)
        .json({ error: true, message: "Memory was not found" });
    }

    memory.title = title;
    memory.story = story;
    memory.visitedDate = visitedDate;
    memory.location = location;
    memory.imageUrl = imageUrl;
    memory.tags = tags || [];

    await memory.save();

    res.status(200).json({
      error: false,
      memory: memory,
      message: "Successfully Updated",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.put("/update-is-favorite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavorite } = req.body;
  const { userId } = req.user;

  try {
    const memory = await Memory.findOne({ _id: id, userId: userId });

    if (!memory) {
      return res
        .status(404)
        .json({ error: true, message: "Memory was not found!" });
    }

    memory.isFavorite = isFavorite;
    await memory.save();
    res.status(200).json({ memory: memory, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Search memory with query
router.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(404).json({ error: true, message: "query is required" });
  }
  try {
    const searchResults = await Memory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { location: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    }).sort({ isFavorite: -1 });
    res.status(200).json({ memories: searchResults });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Filter by date range
router.get("/memory/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    const query = { userId: userId };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.visitedDate = {
        $gte: new Date(startDate),  
        $lte: new Date(endDate)   
      };
    }

    // Find memories that match the query
    const filteredMemories = await Memory.find(query).sort({ isFavorite: -1 });

    res.status(200).json({
      error: false,
      memories: filteredMemories
    });

  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;

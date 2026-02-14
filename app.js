require("dotenv").config();
const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5005;

// Testing if backend is live
app.get("/health", (req, res) => res.send("API is running ✅"));


// MIDDLEWARE
app.use(logger("dev"));
app.use(express.static("public"));

// models import
const User = require("./models/User.model");
const Memory = require("./models/Memory.model");
const Tag = require("./models/Tag.model");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const memoryRoutes = require("./routes/memory.routes");
const tagRoutes = require("./routes/tag.routes");


// ROUTES
app.use("/auth", authRoutes);
app.use("/memories", memoryRoutes);
app.use("/tags", tagRoutes);


//start 💪

mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log(
      `Connected to Mongo ✅! Database name: "${conn.connections[0].name}"`,
    );

    // Start server AFTER DB connection
    app.listen(PORT, () => {
       console.log(`Server running 🚀 at ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
    });
  })
  .catch((err) => {
    console.error(" Error connecting to Mongo ❌", err);
  });

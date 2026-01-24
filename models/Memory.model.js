const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memoriesSchema = new Schema(
  {
    title: { type: String, required: true },
    story: { type: String, required: true },
    location: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    visitedDate: { type: Date },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Memory", memoriesSchema);

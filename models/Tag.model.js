const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
});

tagSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, maxLength: 100 },
  bio: { type: String, required: true, maxLength: 1000 },
  band: { type: String, required: true, maxLength: 100 },
  movie: { type: String, required: true, maxLength: 100 },
  book: { type: String, required: true, maxLength: 100 },
});

// Export model
module.exports = mongoose.model("Profile", ProfileSchema);

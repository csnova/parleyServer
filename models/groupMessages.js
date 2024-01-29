const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupMessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxLength: 100 },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true },
  thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
});

// A static method to the Message model for finding by who it is from
UserSchema.statics.findByFrom = async function (from) {
  return this.findOne({ from });
};

// Export model
module.exports = mongoose.model("GroupMessage", GroupMessageSchema);

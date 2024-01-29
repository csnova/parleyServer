const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true },
  thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  viewed: { type: Boolean, required: true },
});

// A static method to the Message model for finding by who it is from
MessageSchema.statics.findByFrom = async function (from) {
  return this.findOne({ from });
};

// A static method to the Message model for finding by who it is to
MessageSchema.statics.findByTo = async function (to) {
  return this.findOne({ to });
};

// Export model
module.exports = mongoose.model("Message", MessageSchema);

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FriendsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  current: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  requests: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  awaitingApproval: [
    { type: Schema.Types.ObjectId, ref: "User", required: true },
  ],
});

// Export model
module.exports = mongoose.model("Friends", FriendsSchema);

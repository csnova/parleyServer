const Message = require("../models/messages");
const Thread = require("../models/threads");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display Message Details.
exports.message_details = asyncHandler(async (req, res, next) => {
  const [message] = await Promise.all([
    Message.find({ _id: req.body._id }, "from to text timestamp thread viewed ")
      .populate("from")
      .populate("to")
      .exec(),
  ]);
  res.json({
    message: message,
  });
});

// Example displaying message details
// curl -X GET http://localhost:3000/parley/message -H "Content-Type: application/json" -d '{"_id": "65aff020e8bbe910aeb45c84"}'
// Worked 1/22 5:30 pm

// Handle create message.
exports.message_create = asyncHandler(async (req, res, next) => {
  // Check if thread exists
  const [thread1, thread2] = await Promise.all([
    Thread.find({ user1: req.body.from, user2: req.body.to }, "_id").exec(),
    Thread.find({ user1: req.body.to, user2: req.body.from }, "_id").exec(),
  ]);
  // If Thread Get ID
  let threadID;
  if (thread1[0]) {
    threadID = thread1[0]._id;
  } else if (thread2[0]) {
    threadID = thread2[0]._id;
  } else {
    // If Not Thread Create One
    const thread = new Thread({
      user1: req.body.from,
      user2: req.body.to,
    });
    await thread.save();
    const [thread3] = await Promise.all([
      Thread.find({ user1: req.body.from, user2: req.body.to }, "_id").exec(),
    ]);
    threadID = thread3[0]._id;
  }
  threadID = String(threadID);

  // Create Message with Thread ID
  const dateTime = new Date();
  const message = new Message({
    from: req.body.from,
    to: req.body.to,
    text: req.body.text,
    timestamp: dateTime,
    thread: threadID,
    viewed: false,
  });
  await message.save();

  //Send back Thread ID
  res.json(threadID);
});
// Example for sending a message
// curl -X POST http://localhost:3000/parley/message/create -H "Content-Type: application/json" -d '{"from":"65afe6cc865aa8e8a4986721", "to":"65afe6e0865aa8e8a4986728", "text": "Welcome!"}'
// Worked 1/22 5:30 pm

// Handle marking message as viewed
exports.message_viewed = asyncHandler(async (req, res, next) => {
  const [message] = await Promise.all([
    Message.find({ _id: req.body.messageID }).exec(),
  ]);

  // Create a new message object
  const newMessage = new Message({
    from: message[0].from,
    to: message[0].to,
    text: message[0].text,
    timestamp: message[0].timestamp,
    thread: message[0].thread,
    viewed: true,
    _id: message[0]._id,
  });

  const updateMessage = await Message.findByIdAndUpdate(
    message[0]._id,
    newMessage
  );

  //Send back Thread ID
  res.json("Success");
});
// Example for marking a message as viewed
// curl -X POST http://localhost:3000/parley/message/viewed -H "Content-Type: application/json" -d '{"messageID" : "65aff020e8bbe910aeb45c84"}'
// Worked 1/23 9:30 am

// Handle marking message as viewed
exports.message_viewed_all = asyncHandler(async (req, res, next) => {
  const [messageList] = await Promise.all([
    Message.find(
      { thread: req.body.threadID },
      "from to text timestamp thread viewed _id"
    ).exec(),
  ]);

  for (let i = 0; i < messageList.length; i++) {
    let toId = String(messageList[i].to);
    if (toId === req.body.currentUser) {
      // Create a new message object
      const newMessage = new Message({
        from: messageList[i].from,
        to: messageList[i].to,
        text: messageList[i].text,
        timestamp: messageList[i].timestamp,
        thread: messageList[i].thread,
        viewed: true,
        _id: messageList[i]._id,
      });

      const updateMessage = await Message.findByIdAndUpdate(
        messageList[i]._id,
        newMessage
      );
    }
  }

  //Send back Thread ID
  res.json("Success");
});
// Example for marking a message as viewed
// curl -X POST http://localhost:3000/parley/message/viewed/all -H "Content-Type: application/json" -d '{"threadID" : "65b2af9ed8aca8de1ec2ff1d", "currentUser" : "65afe6cc865aa8e8a4986721"}'
// Worked 1/23 9:30 am

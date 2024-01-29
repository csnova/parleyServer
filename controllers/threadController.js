const Thread = require("../models/threads");
const Message = require("../models/messages");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of a users threads.
exports.thread_list = asyncHandler(async (req, res, next) => {
  const [threadList1, threadList2] = await Promise.all([
    Thread.find({ user1: req.params.userID }, "_id user1 user2")
      .populate("user1")
      .populate("user2")
      .exec(),
    Thread.find({ user2: req.params.userID }, "_id user1 user2")
      .populate("user1")
      .populate("user2")
      .exec(),
  ]);

  let threadList = threadList1.concat(threadList2);

  res.json({
    threadList: threadList,
  });
});

// Example list of a users threads.
// curl -X GET http://localhost:3000/parley/thread/65afe69f865aa8e8a4986713
// Worked 1/23 7:30 am

// Display Messages in thread.
exports.thread_messages = asyncHandler(async (req, res, next) => {
  const [messageList] = await Promise.all([
    Message.find(
      { thread: req.params.threadID },
      "_id from to text timestamp viewed"
    )
      .sort({ timestamp: 1 })
      .populate("from")
      .populate("to")
      .exec(),
  ]);

  res.json({
    messageList: messageList,
  });
});

// Example list of messages in a thread.
// curl -X GET http://localhost:3000/parley/thread/messages/65aff020e8bbe910aeb45c81
// Worked 1/23 7:30 am

// Display unviewed message threads
exports.thread_unViewed = asyncHandler(async (req, res, next) => {
  const [messageList] = await Promise.all([
    Message.find({ to: req.params.userID }, "_id from viewed thread")
      .populate("from")
      .exec(),
  ]);

  let unViewed = [];
  for (let i = 0; i < messageList.length; i++) {
    if (!messageList[i].viewed) {
      let isInList = false;
      for (let j = 0; j < unViewed.length; j++) {
        if (String(messageList[i].thread) === String(unViewed[j].thread)) {
          isInList = true;
        }
      }
      if (!isInList) unViewed.push(messageList[i]);
    }
  }

  res.json({
    unViewed: unViewed,
  });
});

// Example list of unViewed threads.
// curl -X GET http://localhost:3000/parley/thread/unViewed/65afe69f865aa8e8a4986713
// Worked 1/23 7:30 am

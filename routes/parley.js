const express = require("express");
const router = express.Router();

// Require controllers
const user_controller = require("../controllers/userController");
const profile_controller = require("../controllers/profileController");
const friend_controller = require("../controllers/friendsController");
const message_controller = require("../controllers/messageController");
const thread_controller = require("../controllers/threadController");

// User Routes
router.get("/user/details/:userID", user_controller.user_detail);
router.get("/user/all", user_controller.user_all);
router.post("/user/sign-up", user_controller.user_sign_up);
router.post("/user/sign-in", user_controller.user_sign_in);
router.post("/user/sign-out", user_controller.user_sign_out);

// Profile Routers
router.get("/profile/:userID", profile_controller.profile_details);
router.post("/profile/update", profile_controller.profile_update);

// Friend Routers
router.get("/friend/:userID", friend_controller.friend_list);
router.get("/friend/status/:userID/:friendID", friend_controller.friend_status);
router.get(
  "/friend/allStats/:userID/:friendID",
  friend_controller.friend_allStats
);
router.post("/friend/request", friend_controller.friend_request);
router.post("/friend/accept", friend_controller.friend_accept_request);
router.post("/friend/remove", friend_controller.friend_remove);

// Message Routers
router.get("/message/:messageID", message_controller.message_details);
router.post("/message/create", message_controller.message_create);
router.post("/message/viewed", message_controller.message_viewed);
router.post("/message/viewed/all", message_controller.message_viewed_all);

// Thread Routers
router.get("/thread/:userID", thread_controller.thread_list);
router.get("/thread/messages/:threadID", thread_controller.thread_messages);
router.get("/thread/unViewed/:userID", thread_controller.thread_unViewed);

module.exports = router;

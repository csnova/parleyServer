const Friends = require("../models/friends");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of a users friends.
exports.friend_list = asyncHandler(async (req, res, next) => {
  const friendsList = await Friends.find(
    { user: req.params.userID },
    "current requests awaitingApproval"
  ).exec();
  let currentUsernameList = [];
  for (let i = 0; i < friendsList[0].current.length; i++) {
    const currentFriend = await User.find(
      { _id: friendsList[0].current[i] },
      "_id username"
    ).exec();
    currentUsernameList.push(currentFriend[0]);
  }
  let requestsUsernameList = [];
  for (let i = 0; i < friendsList[0].requests.length; i++) {
    const currentFriend = await User.find(
      { _id: friendsList[0].requests[i] },
      "_id username"
    ).exec();
    requestsUsernameList.push(currentFriend[0]);
  }
  let approvalUsernameList = [];
  for (let i = 0; i < friendsList[0].awaitingApproval.length; i++) {
    const currentFriend = await User.find(
      { _id: friendsList[0].awaitingApproval[i] },
      "_id username"
    ).exec();
    approvalUsernameList.push(currentFriend[0]);
  }

  const friendsListUsernames = {
    current: currentUsernameList,
    requests: requestsUsernameList,
    awaitingApproval: approvalUsernameList,
  };

  res.json(friendsListUsernames);
});

// Example for getting a list of a users friends
// curl -X GET http://localhost:3000/parley/friend/65b3f74fbbf9e2f3c1823d8b
// Worked 1/22 10:00 am

// Display if 2 users are friends on GET.
exports.friend_status = asyncHandler(async (req, res, next) => {
  const friendsList = await Friends.find(
    { user: req.params.userID },
    "current"
  ).exec();

  // Check if user2 is in the current friend list of user1
  let isFriends = false;
  for (let i = 0; i < friendsList[0].current.length; i++) {
    let currentFriend = String(friendsList[0].current[i]);
    if (currentFriend === req.params.friendID) isFriends = true;
  }

  res.json(isFriends);
});

// Example for checking if 2 users are friends
// curl -X GET http://localhost:3000/parley/friend/status/65afe69f865aa8e8a4986713/65afe6ae865aa8e8a498671a
// Worked 1/22 10:00 am

// Display how 2 users are connected
exports.friend_allStats = asyncHandler(async (req, res, next) => {
  const friendsList = await Friends.find(
    { user: req.params.userID },
    "current requests awaitingApproval"
  ).exec();

  console.log(friendsList);

  // Check if user2 is in the current friend list of user1
  let isFriends = false;
  for (let i = 0; i < friendsList[0].current.length; i++) {
    let currentFriend = String(friendsList[0].current[i]);
    if (currentFriend === req.params.friendID) isFriends = true;
  }

  res.json(isFriends);
});

// Example for checking if 2 users are friends
// curl -X GET http://localhost:3000/parley/friend/allStats/65b3f655bbf9e2f3c1823d6b/65b3f976bbf9e2f3c1823dd4
// Worked 1/22 10:00 am

// Handle add friend request on POST.
exports.friend_request = asyncHandler(async (req, res, next) => {
  const currentFriendsList = await Friends.find(
    { user: req.body.currentUser },
    "user current requests awaitingApproval _id"
  ).exec();
  const requestedFriend = await Friends.find(
    { user: req.body.friendRequest },
    "user current requests awaitingApproval _id"
  ).exec();

  // Check if they are already friends
  let isFriends = false;
  for (let i = 0; i < currentFriendsList[0].current.length; i++) {
    let currentFriend = String(currentFriendsList[0].current[i]);
    if (currentFriend === req.body.friendRequest) isFriends = true;
  }

  // Check if request is already made
  let requestPending = false;
  for (let i = 0; i < currentFriendsList[0].requests.length; i++) {
    let currentFriend = String(currentFriendsList[0].requests[i]);
    if (currentFriend === req.body.friendRequest) requestPending = true;
  }

  // Check if they are awaiting current users approval
  let awaitingApproval = false;
  for (let i = 0; i < currentFriendsList[0].awaitingApproval.length; i++) {
    let currentFriend = String(currentFriendsList[0].awaitingApproval[i]);
    if (currentFriend === req.body.friendRequest) awaitingApproval = true;
  }

  if (isFriends) {
    res.json("already friends ");
  } else if (requestPending) {
    res.json("request already made");
  } else if (awaitingApproval) {
    res.json("request awaiting current users approval");
  } else {
    // Updated Requests list for Current User
    let currentUserRequests = currentFriendsList[0].requests;
    currentUserRequests = currentUserRequests.push(req.body.friendRequest);
    // Create Friends object with new request
    const currentUserFriends = new Friends({
      user: currentFriendsList[0].user,
      current: currentFriendsList[0].current,
      requests: currentFriendsList[0].requests,
      awaitingApproval: currentFriendsList[0].awaitingApproval,
      _id: currentFriendsList[0]._id,
    });
    const updateRequests = await Friends.findByIdAndUpdate(
      currentFriendsList[0]._id,
      currentUserFriends
    );
    // Updated Awaiting Approval list for Requested Friend
    let requestedFriendApproval = requestedFriend[0].awaitingApproval;
    requestedFriendApproval = requestedFriendApproval.push(
      req.body.currentUser
    );
    // Create Friends object with new awaiting approval
    const requestedFriendList = new Friends({
      user: requestedFriend[0].user,
      current: requestedFriend[0].current,
      requests: requestedFriend[0].requests,
      awaitingApproval: requestedFriend[0].awaitingApproval,
      _id: requestedFriend[0]._id,
    });
    const updateAwaitingApproval = await Friends.findByIdAndUpdate(
      requestedFriend[0]._id,
      requestedFriendList
    );
    res.json("Success");
  }
});

// Example for sending a friend request
// curl -X POST http://localhost:3000/parley/friend/request -H "Content-Type: application/json" -d '{"currentUser":"65afe6cc865aa8e8a4986721", "friendRequest":"65afe6e0865aa8e8a4986728"}'
// Worked 1/22 12:00 pm

// Handle accept friend request on POST.
exports.friend_accept_request = asyncHandler(async (req, res, next) => {
  try {
    const currentFriendsList = await Friends.find(
      { user: req.body.currentUser },
      "user current requests awaitingApproval _id"
    ).exec();
    const approvedFriendList = await Friends.find(
      { user: req.body.approvedFriend },
      "user current requests awaitingApproval _id"
    ).exec();
    // Verify they are awaiting current users approval
    let awaitingApproval = false;
    for (let i = 0; i < currentFriendsList[0].awaitingApproval.length; i++) {
      let currentFriend = String(currentFriendsList[0].awaitingApproval[i]);
      if (currentFriend === req.body.approvedFriend) awaitingApproval = true;
    }

    if (!awaitingApproval) {
      res.json("Friend Request Not Found");
    } else {
      // Find awaiting approval request and remove it
      const newAwaitingApproval = [];
      for (let i = 0; i < currentFriendsList[0].awaitingApproval.length; i++) {
        let currentFriend = String(currentFriendsList[0].awaitingApproval[i]);
        if (currentFriend !== req.body.approvedFriend) {
          newAwaitingApproval.push(currentFriendsList[0].awaitingApproval[i]);
        }
      }
      // Add to current friends list
      let newFriendList = currentFriendsList[0].current;
      newFriendList = newFriendList.push(req.body.approvedFriend);
      // Save changes
      const newCurrentFriendsList = new Friends({
        user: currentFriendsList[0].user,
        current: currentFriendsList[0].current,
        requests: currentFriendsList[0].requests,
        awaitingApproval: newAwaitingApproval,
        _id: currentFriendsList[0]._id,
      });
      const updateCurrentUser = await Friends.findByIdAndUpdate(
        currentFriendsList[0]._id,
        newCurrentFriendsList
      );

      // Find request and remove it
      const newRequests = [];
      for (let i = 0; i < approvedFriendList[0].requests.length; i++) {
        let currentRequests = String(approvedFriendList[0].requests[i]);
        if (currentRequests !== req.body.currentUser) {
          newRequests.push(approvedFriendList[0].requests[i]);
        }
      }
      // Add to current friends list
      let newFriendsApproved = approvedFriendList[0].current;
      newFriendsApproved = newFriendsApproved.push(req.body.currentUser);
      // Save changes
      const newApprovedFriendsList = new Friends({
        user: approvedFriendList[0].user,
        current: approvedFriendList[0].current,
        requests: newRequests,
        awaitingApproval: approvedFriendList[0].awaitingApproval,
        _id: approvedFriendList[0]._id,
      });
      const updateApprovedFriend = await Friends.findByIdAndUpdate(
        approvedFriendList[0]._id,
        newApprovedFriendsList
      );

      res.json("Success");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Example for accepting a friend request
// curl -X POST http://localhost:3000/parley/friend/accept -H "Content-Type: application/json" -d '{"currentUser":"65afe6f0865aa8e8a498672f", "approvedFriend":"65afe69f865aa8e8a4986713"}'
// Worked 1/22 12:30 pm

// Handle remove friend on POST.
exports.friend_remove = asyncHandler(async (req, res, next) => {
  const currentFriendsList = await Friends.find(
    { user: req.body.currentUser },
    "user current requests awaitingApproval _id"
  ).exec();
  const removedFriendList = await Friends.find(
    { user: req.body.removedFriend },
    "user current requests awaitingApproval _id"
  ).exec();

  //Check if Friends
  let isFriends = false;
  for (let i = 0; i < currentFriendsList[0].current.length; i++) {
    let currentFriend = String(currentFriendsList[0].current[i]);
    if (currentFriend === req.body.removedFriend) isFriends = true;
  }

  const currentUserFriends = [];
  const removedUserFriends = [];

  if (!isFriends) {
    res.json("not currently friends ");
  } else {
    //Remove from current user friend list
    for (let i = 0; i < currentFriendsList[0].current.length; i++) {
      let currentFriend = String(currentFriendsList[0].current[i]);
      if (currentFriend !== req.body.removedFriend) {
        currentUserFriends.push(currentFriendsList[0].current[i]);
      }
    }
    //Remove from Removed friend list
    for (let i = 0; i < removedFriendList[0].current.length; i++) {
      let currentFriend = String(removedFriendList[0].current[i]);
      if (currentFriend !== req.body.currentUser) {
        removedUserFriends.push(removedFriendList[0].current[i]);
      }
    }
  }

  // Save Changes
  const updateUserFriends = await Friends.findByIdAndUpdate(
    currentFriendsList[0]._id,
    { current: currentUserFriends }
  );

  const updateRemovedFriends = await Friends.findByIdAndUpdate(
    removedFriendList[0]._id,
    { current: removedUserFriends }
  );

  res.json("Success");
});

// Example for accepting a friend request
// curl -X POST http://localhost:3000/parley/friend/remove -H "Content-Type: application/json" -d '{"currentUser":"65b3f655bbf9e2f3c1823d6b", "removedFriend":"65b3f74fbbf9e2f3c1823d8b"}'
// Worked 1/22 12:30 pm

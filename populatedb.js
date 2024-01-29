#! /usr/bin/env node

console.log(
  'This script populates some test users, messages, friends and profiles to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const User = require("./models/user");
const Profile = require("./models/profile");
const Friends = require("./models/friends");
const Thread = require("./models/threads");
const Message = require("./models/messages");

const users = [];
const profiles = [];
const friends = [];
const threads = [];
const messages = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  await createProfiles();
  await createFriends();
  await createThreads();
  await createMessages();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// user[0] will always be the same user, regardless of the order
// in which the elements of promise.all's argument complete.
async function userCreate(index, email, username, password) {
  const user = new User({
    email: email,
    username: username,
    password: password,
  });
  await user.save();
  users[index] = user;
  console.log(`Added user: ${username}`);
}

async function profileCreate(index, user, name, bio, band, movie, book) {
  const profile = new Profile({
    user: user,
    name: name,
    bio: bio,
    band: band,
    movie: movie,
    book: book,
  });
  await profile.save();
  profiles[index] = profile;
  console.log(`Added profile: ${name}`);
}

async function friendsCreate(index, user, current, requests, awaitingApproval) {
  const friend = new Friends({
    user: user,
    current: current,
    requests: requests,
    awaitingApproval: awaitingApproval,
  });
  await friend.save();
  friends[index] = friend;
  console.log(`Added friends list: ${user}`);
}

async function threadCreate(index, users) {
  const thread = new Thread({ users: users });
  await thread.save();
  threads[index] = thread;
  console.log(`Added Thread: ${users}`);
}

async function messageCreate(index, from, to, text, timestamp, thread, viewed) {
  const message = new Message({
    from: from,
    to: to,
    text: text,
    timestamp: timestamp,
    thread: thread,
    viewed: viewed,
  });
  await message.save();
  messages[index] = message;
  console.log(`Added message: ${text}`);
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "albert0@gmail.com", "albert0", "albert0"),
    userCreate(1, "beth1@gmail.com", "beth1", "beth1"),
    userCreate(2, "carl2@gmail.com", "carl2", "carl2"),
    userCreate(3, "debra3@gmail.com", "debra3", "debra3"),
    userCreate(4, "ethan4@gmail.com", "ethan4", "ethan4"),
    userCreate(5, "fred5@gmail.com", "fred5", "fred5"),
    userCreate(6, "gavin6@gmail.com", "gavin6", "gavin6"),
    userCreate(7, "hellen7@gmail.com", "hellen7", "hellen7"),
    userCreate(8, "irene8@gmail.com", "irene8", "irene8"),
    userCreate(9, "jack9@gmail.com", "jack9", "jack9"),
  ]);
}

async function createProfiles() {
  console.log("Adding profiles");
  await Promise.all([
    profileCreate(
      0,
      users[0],
      "Albert",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      1,
      users[1],
      "Beth",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      2,
      users[2],
      "Carl",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      3,
      users[3],
      "Debra",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      4,
      users[4],
      "Ethan",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      5,
      users[5],
      "Fred",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      6,
      users[6],
      "Gavin",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      7,
      users[7],
      "Hellen",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      8,
      users[8],
      "Irene",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
    profileCreate(
      9,
      users[9],
      "Jack",
      "This is my Bio",
      "This is my Favorite Band",
      "This is my Favorite Movie",
      "This is my Favorite Book"
    ),
  ]);
}

async function createFriends() {
  console.log("Adding Friends");
  await Promise.all([
    friendsCreate(
      0,
      users[0],
      [users[2], users[4], users[6], users[8]],
      [users[1]],
      [users[3], users[5]]
    ),
    friendsCreate(
      1,
      users[1],
      [users[3], users[5], users[7], users[9]],
      [users[0]],
      [users[2], users[4]]
    ),
    friendsCreate(
      2,
      users[2],
      [users[0], users[4], users[6], users[8]],
      [users[1]],
      [users[3], users[5]]
    ),
    friendsCreate(
      3,
      users[3],
      [users[1], users[5], users[7], users[9]],
      [users[0]],
      [users[2], users[4]]
    ),
    friendsCreate(
      4,
      users[4],
      [users[2], users[0], users[6], users[8]],
      [users[1]],
      [users[3], users[5]]
    ),
    friendsCreate(
      5,
      users[5],
      [users[3], users[1], users[7], users[9]],
      [users[0]],
      [users[2], users[4]]
    ),
    friendsCreate(
      6,
      users[6],
      [users[2], users[4], users[0], users[8]],
      [users[1]],
      [users[3], users[5]]
    ),
    friendsCreate(
      7,
      users[7],
      [users[3], users[5], users[1], users[9]],
      [users[0]],
      [users[2], users[4]]
    ),
    friendsCreate(
      8,
      users[8],
      [users[2], users[4], users[6], users[0]],
      [users[1]],
      [users[3], users[5]]
    ),
    friendsCreate(
      9,
      users[9],
      [users[3], users[5], users[7], users[1]],
      [users[0]],
      [users[2], users[4]]
    ),
  ]);
}

async function createThreads() {
  console.log("Adding threads");
  await Promise.all(
    [threadCreate(0, [users[0], users[2]])],
    [threadCreate(1, [users[5], users[7]])]
  );
}

async function createMessages() {
  console.log("Adding messages");
  await Promise.all([
    messageCreate(
      0,
      users[0],
      users[2],
      "When did you join? And thank you for accepting my friend request!",
      "2023-12-20T08:42",
      threads[0],
      true
    ),
    messageCreate(
      1,
      users[2],
      users[0],
      "Yeah I just joined a few minutes ago. I didn't even know you were on here! How have you been?",
      "2023-12-20T08:55",
      threads[0],
      true
    ),
    messageCreate(
      2,
      users[0],
      users[2],
      "Okay. Want to get coffee sometime soon?",
      "2023-12-20T09:25",
      threads[0],
      true
    ),
    messageCreate(
      3,
      users[2],
      users[0],
      "Yeah lets do that!",
      "2023-12-20T09:30",
      threads[0],
      true
    ),
    messageCreate(
      4,
      users[0],
      users[2],
      "Thanks!",
      "2023-12-20T09:31",
      threads[0],
      true
    ),
    messageCreate(
      5,
      users[5],
      users[7],
      "Hey, How are you?",
      "2023-12-25T09:50",
      threads[1],
      false
    ),
  ]);
}

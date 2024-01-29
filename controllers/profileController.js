const Profile = require("../models/profile");
const Friends = require("../models/friends");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display detail page for a profile.
exports.profile_details = asyncHandler(async (req, res, next) => {
  const [profile, friendsList] = await Promise.all([
    Profile.find({ user: req.params.userID }, "name bio band movie book user")
      .populate("user")
      .exec(),
    Friends.find({ user: req.params.userID }, "current").exec(),
  ]);

  if (profile === null) {
    // No results.
    const err = new Error("Profile not found");
    err.status = 404;
    return next(err);
  }

  let currentUsernameList = [];
  for (let i = 0; i < friendsList[0].current.length; i++) {
    const currentFriend = await User.find(
      { _id: friendsList[0].current[i] },
      "_id username"
    ).exec();
    currentUsernameList.push(currentFriend[0]);
  }

  res.json({
    profile: profile,
    friends: currentUsernameList,
  });
});

// Example for getting a users profile
// curl -X GET http://localhost:3000/parley/profile/65afe69f865aa8e8a4986713
// Worked 1/22 10:00 am

// Handle profile update on POST.
exports.profile_update = [
  // Validate and sanitize fields.
  body("name").trim(),
  body("bio").trim(),
  body("band").trim(),
  body("movie").trim(),
  body("book").trim(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const [oldProfileData] = await Promise.all([
      Profile.find({ user: req.body.userID }, "_id").exec(),
    ]);
    let profileId = oldProfileData[0]._id;
    profileId = String(profileId);
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    jwt.verify(
      req.body.token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        if (err) {
          console.log(err);
          res.status(401).send();
        } else {
          // Create Profile object with escaped and trimmed data
          const profile = new Profile({
            name: req.body.name,
            bio: req.body.bio,
            band: req.body.band,
            movie: req.body.movie,
            book: req.body.book,
            _id: profileId,
          });

          if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.json({
              errors: errors.array(),
            });
            return;
          } else {
            // Data from form is valid. Save Profile Update.
            const updateProfile = await Profile.findByIdAndUpdate(
              profileId,
              profile
            );
            //Send Back Profile
            res.json({
              profile: {
                name: profile.name,
                bio: profile.bio,
                band: profile.band,
                movie: profile.movie,
                book: profile.book,
              },
            });
          }
        }
      }
    );
  }),
];

// Example for getting a users profile
// curl -X POST http://localhost:3000/parley/profile/update -H "Content-Type: application/json" -d '{"userID":"65ab16999d55fb577750639e", "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWFiMTY5OTlkNTVmYjU3Nzc1MDYzOWUiLCJlbWFpbCI6InNwaWtlQGdtYWlsLmNvbSIsImlhdCI6MTcwNTcxMTI1N30.ABR0G48tH6RxetBqn9KSJTBpP0F29K6rQW33E7-BH8o", "name": "Chip", "bio" : "I like to travel, hike, and explore.", "band": "The Replacements", "movie": "Princess Bride", "book": "The Hobbit"}'
// Worked 1/22 10:00 am

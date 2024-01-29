const User = require("../models/user");
const Friend = require("../models/friends");
const Profile = require("../models/profile");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display detail page for a specific User.
exports.user_detail = asyncHandler(async (req, res, next) => {
  const [specificUser] = await Promise.all([
    User.findById(req.body.userID).exec(),
  ]);

  if (specificUser === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }
  res.json({
    specificUser: specificUser,
  });
});

// Example for getting user details
// curl -X GET http://localhost:3000/parley/user/details -H "Content-Type: application/json" -d '{"userID":"65aac53e9d6b84a1665c718e"}'
// Worked 1/19 4:30 pm

// Display a list of all Users
exports.user_all = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}, "username _id")
    .sort({ username: 1 })
    .exec();
  res.json(allUsers);
});

// Example for getting user details
// curl -X GET http://localhost:3000/parley/user/all
// Worked 1/19 4:30 pm

// Handle User sign up on POST.
exports.user_sign_up = [
  // Validate and sanitize fields.
  body("email").trim().isLength({ min: 5 }).escape(),
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters long.")
    .custom(async (value) => {
      const existingUser = await User.findByUsername(value);
      if (existingUser) {
        // Will use the below as the error message
        throw new Error("A user already exists with this username");
      }
    })
    .isAlphanumeric()
    .withMessage("Username has non-alphanumeric characters.")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .escape(),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords Do Not Match"),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      // Create Users object with escaped and trimmed data
      const user = new User({
        email: req.body.email,
        username: req.body.username.toLowerCase(), // Convert to lowercase
        password: hashedPassword,
      });

      const friend = new Friend({
        user: user._id,
        current: [],
        requests: [],
        awaitingApproval: [],
      });

      const profile = new Profile({
        user: user._id,
        name: " ",
        bio: " ",
        band: " ",
        movie: " ",
        book: " ",
      });

      jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET,
        (err, token) => {
          if (err) return res.status(400).json(err);
          res.json({
            token: token,
            user: {
              _id: user._id,
              username: user.username,
            },
          });
        }
      );

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.json({
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.

        // Save user.
        await user.save();
        await friend.save();
        await profile.save();
      }
    });
  }),
];

// Example Format for a User Signing Up
// curl -X POST http://localhost:3000/parley/user/sign-up -H "Content-Type: application/json" -d '{ "email":"spike@gmail.com", "username":"spike", "password":"nolaforlife", "confirm_password":"nolaforlife"}'
// Worked 1/19 4:30 pm

// Handle User sign in on POST.
exports.user_sign_in = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Could not authenticate",
        user,
      });
    }
    if (err) res.send(err);
    jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) return res.status(400).json(err);
        res.json({
          token: token,
          user: {
            _id: user._id,
            username: user.username,
          },
        });
      }
    );
  })(req, res);
};

// Example Sign In
// curl -X POST http://localhost:3000/parley/user/sign-in -H "Content-Type: application/json" -d '{"username":"spike", "password":"nolaforlife"}'
// Worked 1/19 4:30 pm

// Handle User sign out on POST.
exports.user_sign_out = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json("Success");
  });
});

// Example Sign Out
// curl -X POST http://localhost:3000/parley/user/sign-out
// Worked 1/19 4:30 pm

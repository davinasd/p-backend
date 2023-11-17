const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  jwt.verify(token, "your-secret-key", (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ error: "Unauthorized - Invalid token" });
    }

    res.user = {
      userId: decodedToken.userId,
      username: decodedToken.username,
    };
    next();
  });
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a token (you might want to use a more secure method for a production environment)
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      "your-secret-key",
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    // Send the token in the response
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Home route
router.get("/home", authenticateJWT, (req, res) => {
  try {
    // If the control reaches here, it means the user is authenticated
    // You can access the user information from req.user

    // For example, if you want to send a personalized message:
    const userID = res.user.userId;
    res.status(200).json({ message: `Hello ${userID}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

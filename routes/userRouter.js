const express = require("express");

module.exports = (userService, upload) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/", upload.single("profilePicture"), async (req, res) => {
    try {
      const { username, name, email, password, dateOfBirth, address } =
        req.body;

      if (
        !username ||
        !name ||
        !email ||
        !password ||
        !dateOfBirth ||
        !address
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newUser = {
        username,
        name,
        email,
        password,
        dateOfBirth,
        address,
        profile_picture: req.file ? req.file.filename : null,
      };

      const userId = await userService.createUser(newUser);

      res.status(201).json({ message: "User created successfully", userId });
    } catch (error) {
      if (error.message === "Username or email already in use") {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  router.put(
    "/:username",
    upload.single("profilePicture"),
    async (req, res) => {
      try {
        const usernameToUpdate = req.params.username;
        const { name, email, dateOfBirth, address } = req.body;

        if (!usernameToUpdate) {
          return res.status(400).json({ error: "Missing username parameter" });
        }

        if (!name || !email || !dateOfBirth || !address) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedUser = {
          name,
          email,
          dateOfBirth,
          address,
          profile_picture: req.file ? req.file.filename : null,
        };

        await userService.updateUser(usernameToUpdate, updatedUser);

        res.status(200).json({ message: "User updated successfully" });
      } catch (error) {
        if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    }
  );

  // Define a route to get user details by username
  router.get("/:username", async (req, res) => {
    try {
      const userName = req.params.username; // Extract the userName from the URL parameter

      // Use your UserService or database query to retrieve user details by ID
      const user = await userService.getUserByUsername(userName);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Exclude the password field from the user object
      delete user.password;

      // Return the user details
      res.json(user);
    } catch (error) {
      console.error("Error getting user details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.delete("/:username", async (req, res) => {
    try {
      const usernameToDelete = req.params.username;

      if (!usernameToDelete) {
        return res.status(400).json({ error: "Missing username parameter" });
      }

      await userService.deleteUser(usernameToDelete);

      res.status(200).json({ message: "User soft deleted successfully" });
    } catch (error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  return router;
};

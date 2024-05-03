const express = require("express");
const UserModel = require("../models/userModel"); // Import the UserModel

module.exports = (db) => {
  const router = express.Router();
  const userModel = new UserModel(db);

  // Login Route
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await userModel.findUserByUsername(username);
      if (user) {
        const validPassword = await userModel.verifyUserPassword(
          password,
          user.password
        );
        if (validPassword) {
          req.session.userId = user.id;
          req.session.role = user.role;
          res.redirect(
            req.session.role === "manager" ? "/manager" : "/dashboard"
          );
        } else {
          res.send("Invalid Username or Password");
        }
      } else {
        res.send("Invalid Username or Password");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

  // Manager creates a new customer account
  router.post("/create-user", async (req, res) => {
    if (req.session.role === "manager") {
      const { username, password } = req.body;
      try {
        await userModel.addUser(username, password, "customer");
        res.send("User created successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  });

  return router;
};

const express = require("express");
const UserModel = require("../models/userModel");
const AuthController = require("../controllers/authController");

module.exports = (db) => {
  const router = express.Router();
  const userModel = new UserModel(db);
  const authController = new AuthController(userModel);

  // Setup routes and link them to controller methods
  router.post("/login", (req, res) => authController.login(req, res));
  router.post("/create-user", (req, res) =>
    authController.createUser(req, res)
  );

  return router;
};

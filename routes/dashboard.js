const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const UserController = require("../controllers/userController");

const pool = require("../models/db");
const userModel = new UserModel(pool);
const userController = new UserController(userModel);

// Dashboard route for managers
router.get("/manager-dashboard", (req, res) => {
  if (req.session.role === "manager") {
    res.render("managerDashboard");
  } else {
    res.status(403).send("Unauthorized access");
  }
});

// Dashboard route for clients
router.get("/client-dashboard", (req, res) => {
  if (req.session.role === "client") {
    res.render("clientDashboard");
  } else {
    res.status(403).send("Unauthorized access");
  }
});

// Create user route for managers
router.post("/create-user", (req, res) => {
  if (req.session.role === "manager") {
    userController.createUser(req, res);
  } else {
    res.status(403).send("Unauthorized access");
  }
});

module.exports = router;

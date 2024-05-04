const HttpStatus = require("http-status-codes");
const express = require("express");
const router = express.Router();
const ClientModel = require("../models/clientModel");
const UserModel = require("../models/userModel");
const UserController = require("../controllers/userController");

const pool = require("../models/db");

const clientModel = new ClientModel(pool);
const userModel = new UserModel(pool);
const userController = new UserController(userModel);

// Dashboard route for managers
router.get("/manager-dashboard", (req, res) => {
  if (req.session.role === "manager") {
    res.render("managerDashboard");
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Dashboard route for clients
router.get("/client-dashboard", (req, res) => {
  if (req.session.role === "client") {
    res.render("clientDashboard", { points: req.session.points });
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Create user route for managers
router.post("/create-user", (req, res) => {
  if (req.session.role === "manager") {
    userController.createUser(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Get points route for clients
router.get("/get-points", async (req, res) => {
  if (req.session.role === "client") {
    try {
      const points = await clientModel.getPoints(req.session.userId);
      req.session.points = points;
      res.json({ points: points });
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).send("Error fetching points");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

module.exports = router;

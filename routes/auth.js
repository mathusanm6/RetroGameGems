const express = require("express");
const ClientModel = require("../models/clientModel");
const ManagerModel = require("../models/managerModel");
const UserModel = require("../models/userModel");
const ClientAuthController = require("../controllers/clientAuthController");
const ManagerAuthController = require("../controllers/managerAuthController");
const UserController = require("../controllers/userController");

module.exports = (db) => {
  const router = express.Router();
  const clientModel = new ClientModel(db);
  const managerModel = new ManagerModel(db);
  const userModel = new UserModel(db);
  const clientAuthController = new ClientAuthController(clientModel);
  const managerAuthController = new ManagerAuthController(managerModel);
  const userController = new UserController(userModel);

  // Client login route
  router.post("/client-login", (req, res) =>
    clientAuthController.login(req, res),
  );

  // Manager login route
  router.post("/manager-login", (req, res) =>
    managerAuthController.login(req, res),
  );

  // Logout route
  router.get("/logout", (req, res) => userController.logout(req, res));

  return router;
};

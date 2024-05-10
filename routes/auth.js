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

  // Specific login routes for client and manager
router.get("/client-login", (req, res) => {
  // Directly render the client login page
  if (req.session.userId && req.session.role === "client") {
    res.redirect("/client-dashboard");
  } else if (req.session.userId && req.session.role === "manager") {
    res.redirect("/manager-dashboard");
  } else {
    res.render("login/loginTemplate", {
      loginType: 'Chrononaut',
      formAction: 'client-login',
      backgroundImageClass: 'bg-image-client',
      alternateLoginPath: 'manager-login',
      alternateLoginText: 'Wait, more than a chrononaut? Get on board as a chief!'
    });
  }
});

router.get("/manager-login", (req, res) => {
  // Directly render the manager login page
  if (req.session.userId && req.session.role === "manager") {
    res.redirect("/manager-dashboard");
  } else if (req.session.userId && req.session.role === "client") {
    res.redirect("/client-dashboard");
  } else {
    res.render("login/loginTemplate", {
      loginType: 'Chief',
      formAction: 'manager-login',
      backgroundImageClass: 'bg-image-manager',
      alternateLoginPath: 'client-login',
      alternateLoginText: 'Not a chief? Get on board as a chrononaut!'
    });
  }
});

  // Logout route
  router.get("/logout", (req, res) => userController.logout(req, res));

  return router;
};

const HttpStatus = require("http-status-codes");
const express = require("express");
const router = express.Router();
const ClientModel = require("../models/clientModel");
const ManagerModel = require("../models/managerModel");
const UserModel = require("../models/userModel");
const ClientController = require("../controllers/clientController");
const ManagerController = require("../controllers/managerController");
const UserController = require("../controllers/userController");

const pool = require("../models/db");

const clientModel = new ClientModel(pool);
const managerModel = new ManagerModel(pool);
const userModel = new UserModel(pool);
const clientController = new ClientController(clientModel);
const managerController = new ManagerController(managerModel);
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
router.get("/create-user", (req, res) => {
  if (req.session.role === "manager") {
    res.render("createUser");
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/create-user", (req, res) => {
  if (req.session.role === "manager") {
    userController.createUser(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get("/modify-client", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const clients = await clientModel.getAllClients();
      res.render("modifyClient", { clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching clients");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/modify-client", (req, res) => {
  if (req.session.role === "manager") {
    clientController.modifyClient(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get("/modify-manager", (req, res) => {
  if (req.session.role === "manager") {
    res.render("modifyManager");
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/modify-manager", (req, res) => {
  if (req.session.role === "manager") {
    managerController.modifyManager(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get("/delete-client", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const clients = await clientModel.getAllClients();
      res.render("deleteClient", { clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching clients");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/delete-client", (req, res) => {
  if (req.session.role === "manager") {
    clientController.deleteClient(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Get all clients route for managers
router.get("/get-clients", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const clients = await clientModel.getAllClients();
      res.json({ clients: clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching clients");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get('/get-client/:clientId', async (req, res) => {
  if (req.session.role === "manager") {
      try {
          const clientId = req.params.clientId;
          const client = await clientModel.getClientById(clientId);
          if (client) {
              res.json(client);
          } else {
              res.status(HttpStatus.StatusCodes.NOT_FOUND).send('Client not found');
          }
      } catch (error) {
          console.error("Error fetching client:", error);
          res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching client details");
      }
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
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching points");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

module.exports = router;

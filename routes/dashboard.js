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
    res.render("dashboard/manager/index");
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Dashboard route for clients
router.get("/client-dashboard", (req, res) => {
  if (req.session.role === "client") {
    res.render("dashboard/client/index", { points: req.session.points });
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Create user route for managers
router.get("/create-user", (req, res) => {
  if (req.session.role === "manager") {
    res.render("dashboard/manager/createUser");
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
      res.render("dashboard/manager/modifyClient", { clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching clients");
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
    res.render("dashboard/manager/modifyManager");
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
      res.render("dashboard/manager/deleteClient", { clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching clients");
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
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching clients");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get("/get-client/:clientId", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const clientId = req.params.clientId;
      const client = await clientModel.getClientById(clientId);
      if (client) {
        res.json(client);
      } else {
        res.status(HttpStatus.StatusCodes.NOT_FOUND).send("Client not found");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching client details");
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
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching points");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Add points route for managers
router.get("/add-points", async (req, res) => {
  if (req.session.role === "manager") {
    const clients = await clientModel.getAllClients();
    res.render("dashboard/manager/addPoints", { clients });
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/add-points", (req, res) => {
  if (req.session.role === "manager") {
    clientController.addPoints(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Add gift route for managers
router.get("/add-gift", (req, res) => {
  if (req.session.role === "manager") {
    res.render("dashboard/manager/addGift");
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/add-gift", (req, res) => {
  if (req.session.role === "manager") {
    managerController.addGift(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Modify gift route for managers
router.get("/modify-gift", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const gifts = await managerModel.getAllGifts();
      res.render("dashboard/manager/modifyGift", { gifts });
    } catch (error) {
      console.error("Error fetching gifts:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching gifts");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/modify-gift", (req, res) => {
  if (req.session.role === "manager") {
    managerController.modifyGift(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Get all gifts route for managers
router.get("/get-gifts", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const gifts = await managerModel.getAllGifts();
      res.json({ gifts: gifts });
    } catch (error) {
      console.error("Error fetching gifts:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching gifts");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.get("/get-gift/:giftId", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const giftId = req.params.giftId;
      const gift = await managerModel.getGiftById(giftId);
      if (gift) {
        res.json(gift);
      } else {
        res.status(HttpStatus.StatusCodes.NOT_FOUND).send("Gift not found");
      }
    } catch (error) {
      console.error("Error fetching gift:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching gift details");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

// Delete gift route for managers
router.get("/delete-gift", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const gifts = await managerModel.getAllGifts();
      res.render("dashboard/manager/deleteGift", { gifts });
    } catch (error) {
      console.error("Error fetching gifts:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching gifts");
    }
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

router.post("/delete-gift", (req, res) => {
  if (req.session.role === "manager") {
    managerController.deleteGift(req, res);
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
  }
});

module.exports = router;

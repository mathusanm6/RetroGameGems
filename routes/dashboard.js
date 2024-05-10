const HttpStatus = require("http-status-codes");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { resizeAndConvertImage } = require("../public/utils/imageManager");

const ClientModel = require("../models/clientModel");
const ManagerModel = require("../models/managerModel");
const UserModel = require("../models/userModel");
const ClientController = require("../controllers/clientController");
const ManagerController = require("../controllers/managerController");
const UserController = require("../controllers/userController");
const CartController = require("../controllers/cartController");
const pool = require("../models/db");

const clientModel = new ClientModel(pool);
const managerModel = new ManagerModel(pool);
const userModel = new UserModel(pool);
const clientController = new ClientController(clientModel);
const managerController = new ManagerController(managerModel);
const userController = new UserController(userModel);
const cartController = new CartController();

// Dashboard route for managers
router.get("/manager-dashboard", (req, res) => {
  if (req.session.role === "manager") {
    res.render("dashboard/manager/index");
  } else {
    res.redirect("/manager-login");
  }
});

// Dashboard route for clients
router.get("/client-dashboard", (req, res) => {
  if (req.session.role === "client") {
    res.render("dashboard/client/index", { points: req.session.points });
  } else {
    res.redirect("/client-login");
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

router.get("/get-point/:clientId", async (req, res) => {
  if (req.session.role === "manager") {
    try {
      const clientId = req.params.clientId;
      const points = await clientModel.getPoints(clientId);
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

router.post("/add-gift", upload.single("image"), async (req, res) => {
  if (req.session.role === "manager") {
    const { name, description, quantity, needed_points } = req.body;
    try {
      let imageBuffer = null;
      if (req.file) {
        imageBuffer = await resizeAndConvertImage(req.file.buffer);
      }
      await managerModel.addGift({
        name,
        description,
        image: imageBuffer,
        quantity,
        needed_points,
      });
      res.redirect("/add-gift?success=true&message=Gift added successfully.");
    } catch (error) {
      console.error("Error handling the image upload:", error);
      return res.status(400).send("Failed to process image.");
    }
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

router.post("/modify-gift", upload.single("image"), (req, res) => {
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

      // Convert bytea image data to Base64 for each gift that has an image
      gifts.forEach((gift) => {
        if (gift.image) {
          gift.image = Buffer.from(gift.image).toString("base64");
        }
      });

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
        // Convert bytea image data to Base64 if image exists
        if (gift.image) {
          gift.image = Buffer.from(gift.image).toString("base64");
        }
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

// Get all gifts route for clients
router.get("/view-gifts", async (req, res) => {
  if (req.session.role === "client") {
    try {
      // Récupérez le nombre de points accumulés par le client depuis la session
      const clientPoints = req.session.points;

      // Récupérez uniquement les cadeaux avec un prix inférieur ou égal au nombre de points accumulés par le client
      const gifts =
        await clientModel.getAvailableGiftsBelowPoints(clientPoints);

      res.render("dashboard/client/viewGifts", { gifts });
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

router.use((req, res, next) => {
  if (!req.session.panier) {
    req.session.panier = {
      userId: "unique_user_id",
      items: [],
      totalPrice: 0,
    };
  }
  next();
});

router.post("/add-to-cart", (req, res) => {
  cartController.addToCart(req, res);
});

router.post("/update-cart-item", (req, res) => {
  cartController.updateCartItem(req, res);
});

router.post("/remove-from-cart", (req, res) => {
  cartController.removeFromCart(req, res);
});

router.post("/validate-cart", (req, res) => {
  cartController.validateCart(req, res);
});

router.get("/cart", (req, res) => {
  cartController.getCart(req, res);
});

module.exports = router;

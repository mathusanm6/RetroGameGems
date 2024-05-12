const HttpStatus = require("http-status-codes");
const express = require("express");
const router = express.Router();

const ClientModel = require("../../models/clientModel");
const GiftModel = require("../../models/giftModel");
const TransactionModel = require("../../models/transactionModel");
const ClientController = require("../../controllers/clientController");
const CartController = require("../../controllers/cartController");
const ClientAuthController = require("../../controllers/clientAuthController");
const pool = require("../../models/db");

const clientModel = new ClientModel(pool);
const giftModel = new GiftModel(pool);
const transactionModel = new TransactionModel(pool);
const cartController = new CartController();
const clientController = new ClientController(clientModel);
const clientAuthController = new ClientAuthController(clientModel);

// Client dashboard route
function combineGiftsAndTransactions(gifts, transactions) {
  const giftsById = {};
  gifts.forEach((gift) => {
    giftsById[gift.id] = gift;
  });

  return transactions.map((transaction) => {
    const gift = giftsById[transaction.gift_id];
    return {
      ...transaction,
      gift,
    };
  });
}

router.get(
  "/client-dashboard",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  async (req, res) => {
    if (req.session.role !== "client") {
      return res.redirect("/client-login");
    }

    req.session.points = await clientModel.getPoints(req.session.userId);
    const client = await clientModel.getClientById(req.session.userId);
    try {
      await handleBirthday(req);

      const transactions = await transactionModel.getTransactionsByClientId(
        req.session.userId,
      );
      const all_gifts = await giftModel.getAllGiftsByClientIDs(
        transactions.map((t) => t.gift_id),
      );
      prepareGiftImages(all_gifts);
      const all_gift_transaction = combineGiftsAndTransactions(
        all_gifts,
        transactions,
      );

      // Sort all_gift_transaction by transaction_date (recent first)
      all_gift_transaction.sort((a, b) => {
        return new Date(b.transaction_date) - new Date(a.transaction_date);
      });

      renderDashboard(req, res, all_gift_transaction, client);
    } catch (error) {
      console.error("Error handling client dashboard:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error handling client dashboard");
    }
  },
);

async function handleBirthday(req) {
  // Check if the birthday gift has already been processed
  if (req.session.birthdayProcessed) {
    return;
  }

  const isBirthday = await clientModel.todayIsClientBirthday(
    req.session.userId,
  );
  if (!isBirthday) return;

  const alreadyClaimed = await clientModel.isBirthdayGiftAlreadyClaimed(
    req.session.userId,
  );
  if (alreadyClaimed) return;

  const points = await clientModel.addPoints(req.session.userId, 500);
  const gift = await giftModel.getRandomGiftUserDontHave(req.session.userId);

  if (!gift) {
    console.error("No gift available for birthday");
    return;
  }

  await transactionModel.addTransaction(req.session.userId, gift.id, true);

  req.session.points = points;
  req.session.birthdayGift = {
    claimed: true,
    name: gift.name,
    description: gift.description,
    image: Buffer.from(gift.image).toString("base64"),
  };

  // Set the session flag to true after processing the birthday gift
  req.session.birthdayProcessed = true;
}

function prepareGiftImages(gifts) {
  gifts.forEach((gift) => {
    if (gift.image) {
      gift.image = Buffer.from(gift.image).toString("base64");
    }
  });
}

function renderDashboard(req, res, all_gift_transaction, client) {
  // Prepare birthday details to be displayed on the dashboard
  let birthdayDetails = {};

  // Check if the birthday gift has been claimed and not yet acknowledged
  if (!req.session.birthdayAcknowledged && req.session.birthdayGift?.claimed) {
    birthdayDetails = {
      birthdayGift: true,
      giftName: req.session.birthdayGift.name,
      giftDescription: req.session.birthdayGift.description,
      giftImage: req.session.birthdayGift.image,
    };

    // Set the session flag to true after displaying the birthday gift for the first time
    req.session.birthdayAcknowledged = true;
  }

  res.render("dashboard/client/index", {
    points: req.session.points,
    birthdayDetails: birthdayDetails,
    all_gift_transaction: all_gift_transaction,
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email,
  });
}

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

// Get all gifts route for clients
router.get(
  "/view-gifts",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  async (req, res) => {
    if (req.session.role === "client") {
      try {
        const clientPoints = req.session.points;
        const cartTotalPrice = req.session.cart?.totalPrice || 0;
        const gifts =
          await giftModel.getAvailableGiftsBelowPointsUserDoesNotHave(
            req.session.userId,
            clientPoints - cartTotalPrice,
          );
        // Sort gifts by needed points
        gifts.sort((a, b) => a.needed_points - b.needed_points);
        res.render("dashboard/client/viewGifts", {
          gifts,
          totalPoints: clientPoints,
          usedPoints: cartTotalPrice,
        });
      } catch (error) {
        console.error("Error fetching gifts:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Error fetching gifts");
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
    }
  },
);

// Cart routes for clients
router.get(
  "/cart",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  cartController.getCart.bind(cartController),
);
router.post(
  "/add-to-cart",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  cartController.addToCart.bind(cartController),
);
router.post(
  "/remove-from-cart",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  cartController.removeFromCart.bind(cartController),
);
router.post(
  "/validate-cart",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  cartController.validateCart.bind(cartController),
);

router.get(
  "/confirmation",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  (req, res) => {
    res.render("dashboard/client/confirmation");
  },
);

// Change password route for clients
router.get(
  "/change-password",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  (req, res) => {
    res.render("dashboard/client/changePassword");
  },
);

router.post(
  "/change-password",
  clientAuthController.ensureAuthenticated.bind(clientAuthController),
  clientController.changePassword.bind(clientController),
);

module.exports = router;

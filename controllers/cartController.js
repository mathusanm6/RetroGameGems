const ClientModel = require("../models/clientModel");
const GiftModel = require("../models/giftModel");
const HttpStatus = require("http-status-codes");
const pool = require("../models/db");

class CartController {
  constructor() {
    this.clientModel = new ClientModel(pool);
    this.giftModel = new GiftModel(pool);
  }

  async addToCart(req, res) {
    const { giftId, quantity } = req.body;

    if (!req.session.cart) {
      req.session.cart = { items: [], totalPrice: 0 };
    }

    try {
      const gift = await this.giftModel.getGiftById(giftId);

      // if points are not enough to buy the gift
      const cartTotalPrice = req.session.cart.totalPrice;
      if (gift.needed_points * quantity + cartTotalPrice > req.session.points) {
        return res.redirect(
          "/view-gifts?success=false&message=Not enough points",
        );
      }

      const itemInCart = req.session.cart.items.find(
        (item) => item.giftId === giftId,
      );

      if (itemInCart) {
        itemInCart.quantity += parseInt(quantity);
      } else {
        req.session.cart.items.push({
          giftId,
          name: gift.name,
          price: gift.needed_points,
          quantity: parseInt(quantity),
        });
      }

      req.session.cart.totalPrice += gift.needed_points * quantity;

      res.redirect("/cart");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Impossible to add item to cart");
    }
  }

  async removeFromCart(req, res) {
    const { giftId } = req.body;

    if (!req.session.cart) {
      req.session.cart = { items: [], totalPrice: 0 };
    }

    try {
      const itemIndex = req.session.cart.items.findIndex(
        (item) => item.giftId === giftId,
      );

      if (itemIndex !== -1) {
        const removedItem = req.session.cart.items.splice(itemIndex, 1)[0];
        req.session.cart.totalPrice -= removedItem.price * removedItem.quantity;
      }

      res.redirect("/cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Impossible to remove item from cart");
    }
  }

  async validateCart(req, res) {
    if (!req.session.cart) {
      req.session.cart = { items: [], totalPrice: 0 };
    }

    if (
      !req.session.userId ||
      !req.session.points ||
      req.session.role !== "client"
    ) {
      console.error("Unauthorized access. Missing required session data.");
      return res
        .status(HttpStatus.StatusCodes.UNAUTHORIZED)
        .send("Unauthorized access.");
    }

    try {
      const clientId = req.session.userId;
      const totalPrice = req.session.cart.totalPrice;

      if (totalPrice > req.session.points) {
        return res.redirect("/cart?success=false&message=Not enough points");
      }

      // Deduct points from client
      await this.clientModel.deductPoints(clientId, totalPrice);
      req.session.points -= totalPrice;

      // Reduce quantity of each gift
      for (const item of req.session.cart.items) {
        await this.giftModel.reduceGiftQuantity(item.giftId, item.quantity);
      }

      // Add transaction for each gift
      for (const item of req.session.cart.items) {
        await this.addTransaction(clientId, item.giftId);
      }

      // Clear cart
      req.session.cart = { items: [], totalPrice: 0 };

      res.redirect("/confirmation");
    } catch (error) {
      console.error("Error validating cart:", error);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Impossible to validate cart");
    }
  }

  async addTransaction(clientId, giftId) {
    const query =
      "INSERT INTO loyalty_card.transactions (client_id, gift_id, is_birthday_gift, transaction_date) VALUES ($1, $2, false, CURRENT_DATE)";
    try {
      await pool.query(query, [clientId, giftId]);
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  async getCart(req, res) {
    if (!req.session.cart) {
      req.session.cart = { items: [], totalPrice: 0 };
    }

    res.render("dashboard/client/cart", {
      items: req.session.cart.items,
      totalPrice: req.session.cart.totalPrice,
    });
  }
}

module.exports = CartController;

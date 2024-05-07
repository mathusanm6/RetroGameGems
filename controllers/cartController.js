const bcrypt = require("bcryptjs");
const ClientModel = require("../models/clientModel");
const HttpStatus = require("http-status-codes");
const pool = require("../models/db");

class CartController {
  constructor() {
    this.clientModel = new ClientModel(pool); // Créez une instance de clientModel
    this.cart = {
      items: [],
      totalPrice: 0
    };
  }

  async addToCart(req, res) {
    const { giftId, quantity } = req.body;

    try {
      // Récupérez les informations sur le produit à partir de la base de données ou d'une autre source
      const gift = await this.clientModel.getGiftById(giftId); // Utilisez l'instance de clientModel

      // Ajoutez les informations sur le produit au panier
      this.cart.items.push({ 
        giftId, 
        name: gift.name, 
        price: gift.price, 
        quantity 
      });

      // Mettez à jour le prix total du panier
      this.cart.totalPrice += gift.price * quantity;

      res.redirect("/cart"); // Redirigez vers la page du panier
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'article au panier :", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible d'ajouter l'article au panier");
    }
  }

  async updateCartItem(req, res) {
    const { giftId, quantity } = req.body;

    try {
      // Recherchez l'article correspondant dans le panier
      const itemToUpdate = this.cart.items.find(item => item.giftId === giftId);

      // Mettez à jour la quantité de l'article
      if (itemToUpdate) {
        const prevQuantity = itemToUpdate.quantity;
        itemToUpdate.quantity = quantity;

        // Mettez à jour le prix total du panier en fonction de la modification de la quantité
        const giftPrice = 100; // Prix fictif pour l'exemple, remplacez-le par la logique réelle
        this.cart.totalPrice += (quantity - prevQuantity) * giftPrice;

        res.redirect("/cart"); // Redirigez vers la page du panier
      } else {
        res.status(HttpStatus.StatusCodes.NOT_FOUND).send("Article non trouvé dans le panier");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article du panier :", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible de mettre à jour l'article du panier");
    }
  }

  async removeFromCart(req, res) {
    const { giftId } = req.body;

    try {
      // Recherchez l'index de l'article à supprimer dans le panier
      const itemIndex = this.cart.items.findIndex(item => item.giftId === giftId);

      // Si l'article existe dans le panier, supprimez-le
      if (itemIndex !== -1) {
        const removedItem = this.cart.items.splice(itemIndex, 1)[0];

        // Mettez à jour le prix total du panier en soustrayant le prix de l'article supprimé
        const giftPrice = 100; // Prix fictif pour l'exemple, remplacez-le par la logique réelle
        this.cart.totalPrice -= giftPrice * removedItem.quantity;

        res.redirect("/cart"); // Redirigez vers la page du panier
      } else {
        res.status(HttpStatus.StatusCodes.NOT_FOUND).send("Article non trouvé dans le panier");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article du panier :", error);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible de supprimer l'article du panier");
    }
  }

  async getCart(req, res) {
    // Récupérez les articles et le prix total du panier pour les passer à la vue
    res.render("dashboard/client/cart", { items: this.cart.items, totalPrice: this.cart.totalPrice });
  }
}

module.exports = CartController;

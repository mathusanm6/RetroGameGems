const bcrypt = require("bcryptjs");
const ClientModel = require("../models/clientModel");
const HttpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const ClientModel = require("../models/clientModel");
const HttpStatus = require("http-status-codes");
const pool = require("../models/db");

class CartController {
    constructor() {
        this.clientModel = new ClientModel(pool);
        this.cart = {
            items: [],
            totalPrice: 0
        };
    }

    async addToCart(req, res) {
        const { giftId, quantity } = req.body;

        try {
            const gift = await this.clientModel.getGiftById(giftId);

            let totalPointsInCart = 0;
            this.cart.items.forEach(item => {
                totalPointsInCart += item.price * item.quantity;
            });

            if (totalPointsInCart + (gift.needed_points * quantity) > req.session.points) {
                throw new Error("Vous n'avez pas suffisamment de points pour acheter tous les articles.");
            }

            this.cart.items.push({ 
                giftId, 
                name: gift.name, 
                price: gift.needed_points, 
                quantity 
            });

            this.cart.totalPrice += gift.needed_points * quantity;

            res.redirect("/cart");
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'article au panier :", error);
            res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible d'ajouter l'article au panier");
        }
    }

    async updateCartItem(req, res) {
        const { giftId, quantity } = req.body;

        try {
            const itemToUpdate = this.cart.items.find(item => item.giftId === giftId);

            if (!itemToUpdate) {
                throw new Error("Article non trouvé dans le panier");
            }

            const gift = await this.clientModel.getGiftById(giftId);

            if (quantity > gift.quantity) {
                throw new Error("Quantité demandée supérieure à la quantité disponible en stock.");
            }

            const updatedTotalPrice = this.cart.totalPrice + (quantity - itemToUpdate.quantity) * gift.price;

            if (updatedTotalPrice <= req.session.points) {
                const prevQuantity = itemToUpdate.quantity;
                itemToUpdate.quantity = quantity;
                this.cart.totalPrice = updatedTotalPrice;
                res.redirect("/cart");
            } else {
                throw new Error("La somme totale des points dans le panier dépasse votre nombre de points disponibles.");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'article du panier :", error);
            res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible de mettre à jour l'article du panier");
        }
    }

    async removeFromCart(req, res) {
        const { giftId } = req.body;

        try {
            const itemIndex = this.cart.items.findIndex(item => item.giftId === giftId);

            if (itemIndex !== -1) {
                const removedItem = this.cart.items.splice(itemIndex, 1)[0];
                const giftPrice = 100;
                this.cart.totalPrice -= giftPrice * removedItem.quantity;
                res.redirect("/cart");
            } else {
                res.status(HttpStatus.StatusCodes.NOT_FOUND).send("Article non trouvé dans le panier");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'article du panier :", error);
            res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible de supprimer l'article du panier");
        }
    }

    async validateCart(req, res) {
        try {
            let totalPrice = 0;
            this.cart.items.forEach(item => {
                totalPrice += item.price * item.quantity;
            });

            if (totalPrice > req.session.points) {
                throw new Error("Vous n'avez pas suffisamment de points pour acheter tous les articles dans votre panier.");
            }

            const clientId = req.session.clientId;
            await this.clientModel.deductPoints(clientId, totalPrice);
            this.cart = { items: [], totalPrice: 0 };
            res.redirect("/confirmation");
        } catch (error) {
            console.error("Erreur lors de la validation du panier :", error);
            res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Impossible de valider le panier");
        }
    }

    async getCart(req, res) {
        let totalPrice = 0;
        this.cart.items.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        res.render("dashboard/client/cart", { items: this.cart.items, totalPrice: totalPrice });
    }
}

module.exports = CartController;
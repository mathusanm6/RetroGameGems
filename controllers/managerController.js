const HttpStatus = require("http-status-codes");

class managerController {
  constructor(managerModel, giftModel) {
    this.managerModel = managerModel;
    this.giftModel = giftModel;
  }

  async modifyManager(req, res) {
    if (req.session.role === "manager") {
      var { email, first_name, last_name, password } = req.body;

      const manager = await this.managerModel.findManagerById(
        req.session.userId,
      );

      if (!email) {
        email = manager.email;
      }

      if (!first_name) {
        first_name = manager.first_name;
      }

      if (!last_name) {
        last_name = manager.last_name;
      }

      if (!password) {
        password = manager.password;
      }

      try {
        await this.managerModel.updateManager(req.session.userId, {
          email,
          first_name,
          last_name,
          password,
        });
        return res.redirect(
          "/modify-manager?success=true&message=Your information updated successfully.",
        );
      } catch (error) {
        console.error("Error updating manager:", error);
        return res.redirect(
          "/modify-manager?success=false&message=Failed to update your information.",
        );
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async addGift(req, res) {
    if (req.session.role === "manager") {
      const { name, description, quantity, needed_points } = req.body;
      const image = req.file ? req.file.filename : null;

      try {
        await this.giftModel.addGift({
          name,
          description,
          image,
          quantity,
          needed_points,
        });
        return res.redirect(
          "/add-gift?success=true&message=Gift added successfully.",
        );
      } catch (error) {
        console.error("Error adding gift:", error);
        return res.redirect(
          "/add-gift?success=false&message=Failed to add gift.",
        );
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async modifyGift(req, res) {
    if (req.session.role === "manager") {
      const { giftId, name, description, quantity, needed_points } = req.body;
      let image = null;
      if (req.file) {
        image = req.file.buffer;
      } else {
        const gift = await this.giftModel.getGiftById(giftId);
        image = gift.image;
      }

      try {
        await this.giftModel.updateGift(giftId, {
          name,
          description,
          image,
          quantity,
          needed_points,
        });
        return res.redirect(
          "/modify-gift?success=true&message=Gift updated successfully.",
        );
      } catch (error) {
        console.error("Error updating gift:", error);
        return res.redirect(
          "/modify-gift?success=false&message=Failed to update gift.",
        );
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async deleteGift(req, res) {
    if (req.session.role === "manager") {
      const { giftId } = req.body;

      try {
        await this.giftModel.deleteGift(giftId);
        return res.redirect(
          "/delete-gift?success=true&message=Gift deleted successfully.",
        );
      } catch (error) {
        console.error("Error deleting gift:", error);
        return res.redirect(
          "/delete-gift?success=false&message=Failed to delete gift.",
        );
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }
}

module.exports = managerController;

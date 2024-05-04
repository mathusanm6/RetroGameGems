const HttpStatus = require("http-status-codes");

class managerController {
  constructor(managerModel) {
    this.managerModel = managerModel;
  }

  async modifyManager(req, res) {
    if (req.session.role === "manager") {
      const { email, first_name, last_name, password } = req.body;

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
      const { name, description, needed_points } = req.body;

      try {
        await this.managerModel.addGift({
          name,
          description,
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
      const { giftId, name, description, needed_points } = req.body;

      try {
        await this.managerModel.updateGift(giftId, {
          name,
          description,
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
        await this.managerModel.deleteGift(giftId);
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

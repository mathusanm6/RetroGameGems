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
        res.send("Manager credentials updated successfully.");
      } catch (error) {
        console.error("Error updating manager:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to update manager.");
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
        res.send("Gift added successfully.");
      } catch (error) {
        console.error("Error adding gift:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to add gift.");
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
        res.send("Gift updated successfully.");
      } catch (error) {
        console.error("Error updating gift:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to update gift.");
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
        res.send("Gift deleted successfully.");
      } catch (error) {
        console.error("Error deleting gift:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to delete gift.");
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }
}

module.exports = managerController;

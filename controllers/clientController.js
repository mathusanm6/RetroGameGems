const HttpStatus = require("http-status-codes");

class ClientController {
  constructor(clientModel) {
    this.clientModel = clientModel;
  }

  async modifyClient(req, res) {
    if (req.session.role === "manager") {
      const { clientId, email, first_name, last_name, birth_date } = req.body;
      try {
        await this.clientModel.updateClient(clientId, {
          email,
          first_name,
          last_name,
          birth_date,
        });
        res.send("Client updated successfully.");
      } catch (error) {
        console.error("Error updating client:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to update client.");
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async deleteClient(req, res) {
    if (req.session.role === "manager") {
      const { clientId } = req.body;
      try {
        await this.clientModel.deleteClient(clientId);
        res.send("Client deleted successfully.");
      } catch (error) {
        console.error("Error deleting client:", error);
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to delete client.");
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async addPoints(req, res) {
    if (req.session.role === "manager") {
      const { clientId, points } = req.body;
      if (!clientId || points <= 0) {
        return res.status(400).send("Invalid client or points data.");
      }
      try {
        await this.clientModel.addPoints(clientId, points);
        res.redirect("/manager-dashboard"); // Or indicate success another way
      } catch (error) {
        console.error("Error adding points:", error);
        res.status(500).send("Failed to add points to client.");
      }
    } else {
      res.status(403).send("Unauthorized access");
    }
  }
}

module.exports = ClientController;

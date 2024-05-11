const HttpStatus = require("http-status-codes");

class clientController {
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
        return res.redirect(
          `/modify-client?success=true&message=Client updated successfully`,
        );
      } catch (error) {
        console.error("Error updating client:", error);
        return res.redirect(
          `/modify-client?success=false&message=Failed to update client`,
        );
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access.");
    }
  }

  async deleteClient(req, res) {
    const { clientId } = req.body;
    try {
      await this.clientModel.deleteClient(clientId);
      res.redirect(
        "/delete-client?success=true&message=Client deleted successfully.",
      );
    } catch (error) {
      console.error("Error deleting client:", error);
      res.redirect(
        "/delete-client?success=false&message=Failed to delete client.",
      );
    }
  }

  async addPoints(req, res) {
    if (req.session.role === "manager") {
      const { clientId, points } = req.body;
      if (!clientId || points <= 0) {
        return res.redirect("/add-points?success=false");
      }

      try {
        await this.clientModel.addPoints(clientId, points);
        const client = await this.clientModel.getClientById(clientId);
        res.redirect(
          "/add-points?success=true&clientId=" +
            clientId +
            "&clientFirstName=" +
            client.first_name +
            "&clientLastName=" +
            client.last_name +
            "&points=" +
            points,
        );
      } catch (error) {
        console.error("Error adding points:", error);
        res.redirect("/add-points?success=false");
      }
    } else {
      res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized access");
    }
  }
}

module.exports = clientController;

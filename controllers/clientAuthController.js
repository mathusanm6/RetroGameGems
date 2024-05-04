const HttpStatus = require("http-status-codes");

class clientAuthController {
  constructor(clientModel) {
    this.clientModel = clientModel;
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const client = await this.clientModel.findClientByEmail(email);
      if (client) {
        const validPassword = await this.clientModel.verifyUserPassword(
          password,
          client.password,
        );
        if (validPassword) {
          req.session.userId = client.id;
          req.session.role = "client";
          req.session.points = client.points;
          res.redirect("/client-dashboard");
        } else {
          res.send("Invalid Email or Password");
        }
      } else {
        res.send("Invalid Email or Password");
      }
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Internal Server Error");
    }
  }
}

module.exports = clientAuthController;

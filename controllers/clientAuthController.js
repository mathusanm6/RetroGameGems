const HttpStatus = require("http-status-codes");

class ClientAuthController {
  constructor(clientModel) {
    this.clientModel = clientModel;
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const client = await this.clientModel.findClientByEmail(email);
      if (client) {
        const validPassword = await this.clientModel.verifyUserPassword(password, client.password);
        if (validPassword) {
          req.session.userId = client.id;
          req.session.role = "client";
          req.session.points = client.points;
          req.session.save((err) => {
            if (err) {
              console.error(err);
              res
                .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .send("Internal Server Error");
            }
            res.redirect("/client-dashboard");
          });
        } else {
          res.redirect(
            "/client-login?success=false&message=Invalid Email or Password",
          );
        }
      } else {
        res.redirect(
          "/client-login?success=false&message=Invalid Email or Password",
        );
      }
    } catch (err) {
      console.error(err);
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
    }
  }

  ensureAuthenticated(req, res, next) {
    if (req.session.role === "client" && req.session.userId) {
      next();
    } else {
      res.status(HttpStatus.StatusCodes.UNAUTHORIZED).redirect("/auth/client-login");
    }
  }
}

module.exports = ClientAuthController;


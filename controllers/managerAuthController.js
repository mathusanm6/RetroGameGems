const HttpStatus = require("http-status-codes");

class managerAuthController {
  constructor(managerModel) {
    this.managerModel = managerModel;
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const manager = await this.managerModel.findManagerByEmail(email);
      if (manager) {
        const validPassword = await this.managerModel.verifyPassword(
          password,
          manager.password,
        );
        if (validPassword) {
          req.session.userId = manager.id;
          req.session.role = "manager";
          req.session.save((err) => {
            if (err) {
              console.error(err);
              res
                .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .send("Internal Server Error");
            }
            res.redirect("/manager-dashboard");
          });
        } else {
          res.redirect("/manager-login?success=false&message=Invalid Email or Password")
        }
      } else {
        res.redirect("/manager-login?success=false&message=Invalid Email or Password")
      }
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Internal Server Error");
    }
  }
}

module.exports = managerAuthController;

const HttpStatus = require("http-status-codes");
const ManagerModel = require("../models/managerModel");

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
          manager.password
        );
        if (validPassword) {
          req.session.userId = manager.id;
          req.session.role = "manager";
          res.redirect("/manager-dashboard");
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

module.exports = managerAuthController;

const UserModel = require("../models/userModel");

class AuthController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async login(req, res) {
    const { username, password } = req.body;
    try {
      const user = await this.userModel.findUserByUsername(username);
      if (user) {
        const validPassword = await this.userModel.verifyUserPassword(
          password,
          user.password
        );
        if (validPassword) {
          req.session.userId = user.id;
          req.session.role = user.role;
          res.redirect(
            req.session.role === "manager" ? "/manager" : "/dashboard"
          );
        } else {
          res.send("Invalid Username or Password");
        }
      } else {
        res.send("Invalid Username or Password");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }

  async createUser(req, res) {
    if (req.session.role === "manager") {
      const { username, password } = req.body;
      try {
        await this.userModel.addUser(username, password, "customer");
        res.send("User created successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  }
}

module.exports = AuthController;

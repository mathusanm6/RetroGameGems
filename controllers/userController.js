const HttpStatus = require("http-status-codes");

class userController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async createUser(req, res) {
    if (req.session.role === "manager") {
      const { email, password, first_name, last_name, role, birth_date } =
        req.body;
      try {
        const existingUser = await this.userModel.findUserByEmail(email, role);
        if (existingUser) {
          return res.redirect(`/create-user?success=false&message=User already exists`);
        } else {
          await this.userModel.addUser(
            email,
            password,
            last_name,
            first_name,
            role,
            birth_date,
          );
          return res.redirect(`/create-user?success=true&message=User created successfully`);
        }
      } catch (err) {
        console.error(err);
        return res.redirect(`/create-user?success=false&message=Failed to create user`);
      }
    } else {
      return res.redirect("/");
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Failed to log out");
      }
      // Redirect to home page after successful logout
      res.redirect("/");
    });
  }
}

module.exports = userController;

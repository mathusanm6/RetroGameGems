const HttpStatus = require("http-status-codes");

class ManagerController {
  constructor(managerModel) {
    this.managerModel = managerModel;
  }

  async modifyManager(req, res) {
    if (
      req.session.role === "manager" &&
      req.session.userId === req.body.managerId
    ) {
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
}

module.exports = ManagerController;

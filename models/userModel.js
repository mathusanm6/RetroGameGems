const ClientModel = require("../models/clientModel");
const ManagerModel = require("../models/managerModel");

class userModel {
  constructor(db) {
    this.db = db;
  }

  async findUserByEmail(email, role) {
    if (role === "client") {
      const clientModel = new ClientModel(this.db);
      return await clientModel.findClientByEmail(email);
    } else if (role === "manager") {
      const managerModel = new ManagerModel(this.db);
      return await managerModel.findManagerByEmail(email);
    }
  }

  async addUser(email, password, last_name, first_name, role, birth_date) {
    if (role === "client") {
      const clientModel = new ClientModel(this.db);
      return await clientModel.addClient(
        email,
        password,
        last_name,
        first_name,
        birth_date
      );
    } else if (role === "manager") {
      const managerModel = new ManagerModel(this.db);
      return await managerModel.addManager(
        email,
        password,
        last_name,
        first_name
      );
    }
  }

  async verifyPassword(userPassword, hashedPassword) {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}

module.exports = userModel;

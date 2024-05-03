const bcrypt = require("bcryptjs");

class UserModel {
  constructor(db) {
    this.db = db;
  }

  async findUserByUsername(username) {
    const query = "SELECT * FROM loyalty_card.users WHERE username = $1";
    const result = await this.db.query(query, [username]);
    return result.rows[0];
  }

  async addUser(username, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO loyalty_card.users (username, password, role) VALUES ($1, $2, $3)";
    await this.db.query(query, [username, hashedPassword, role]);
  }

  async verifyUserPassword(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
  }
}

module.exports = UserModel;

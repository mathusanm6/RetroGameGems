const bcrypt = require("bcryptjs");

class managerModel {
  constructor(db) {
    this.db = db;
  }

  async findManagerByEmail(email) {
    const query = "SELECT * FROM loyalty_card.managers WHERE email = $1";
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  async addManager(email, password, first_name, last_name) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO loyalty_card.managers (email, password, first_name, last_name) VALUES ($1, $2, $3, $4)";
    await this.db.query(query, [email, hashedPassword, first_name, last_name]);
  }

  async verifyPassword(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
  }
}

module.exports = managerModel;

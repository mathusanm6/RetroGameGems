const bcrypt = require("bcryptjs");

class clientModel {
  constructor(db) {
    this.db = db;
  }

  async findClientByEmail(email) {
    const query = "SELECT * FROM loyalty_card.clients WHERE email = $1";
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  async addClient(email, password, last_name, first_name, birth_date) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO loyalty_card.clients (email, password, last_name, first_name, birth_date) VALUES ($1, $2, $3, $4, $5)";
    await this.db.query(query, [
      email,
      hashedPassword,
      last_name,
      first_name,
      birth_date,
    ]);
  }

  async verifyUserPassword(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
  }

  async getPoints(clientId) {
    try {
      const query = "SELECT points FROM loyalty_card.clients WHERE id = $1";
      const result = await this.db.query(query, [clientId]);
      if (result.rows.length > 0) {
        return result.rows[0].points;
      } else {
        console.log("No client found with that ID.");
        return null; // No client found
      }
    } catch (error) {
      console.error("Error getting points:", error);
      throw error;
    }
  }
}

module.exports = clientModel;

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

  async updateManager(managerId, managerData) {
    const { email, first_name, last_name, password } = managerData;
    const updates = [];
    const values = [];

    if (email && email.trim() !== "") {
      updates.push("email = $1");
      values.push(email);
    }
    if (first_name && first_name.trim() !== "") {
      updates.push("first_name = $2");
      values.push(first_name);
    }
    if (last_name && last_name.trim() !== "") {
      updates.push("last_name = $3");
      values.push(last_name);
    }
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = $4");
      values.push(hashedPassword);
    }

    if (values.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    values.push(managerId);
    const query = `update loyalty_card.managers set ${updates.join(", ")} where id = $${values.length}`;
    await this.db.query(query, values);
  }

  async verifyPassword(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
  }
}

module.exports = managerModel;

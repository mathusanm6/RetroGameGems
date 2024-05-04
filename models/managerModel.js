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

  async addGift(giftData) {
    const { name, description, needed_points } = giftData;
    const query =
      "INSERT INTO loyalty_card.gifts (name, description, needed_points) VALUES ($1, $2, $3)";
    await this.db.query(query, [name, description, needed_points]);
  }

  async getAllGifts() {
    const query = "SELECT * FROM loyalty_card.gifts";
    const result = await this.db.query(query);
    return result.rows;
  }

  async getGiftById(giftId) {
    const query = "SELECT * FROM loyalty_card.gifts WHERE id = $1";
    const result = await this.db.query(query, [giftId]);
    return result.rows[0];
  }

  async updateGift(giftId, giftData) {
    const { name, description, needed_points } = giftData;
    const updates = [];
    const values = [];

    if (name && name.trim() !== "") {
      updates.push("name = $1");
      values.push(name);
    }
    if (description && description.trim() !== "") {
      updates.push("description = $2");
      values.push(description);
    }
    if (needed_points) {
      updates.push("needed_points = $3");
      values.push(needed_points);
    }

    if (values.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    values.push(giftId);
    const query = `update loyalty_card.gifts set ${updates.join(", ")} where id = $${values.length}`;
    await this.db.query(query, values);
  }

  async deleteGift(giftId) {
    const query = "DELETE FROM loyalty_card.gifts WHERE id = $1";
    await this.db.query(query, [giftId]);
  }
}

module.exports = managerModel;

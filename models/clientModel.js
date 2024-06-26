const bcrypt = require("bcryptjs");
const pool = require("./db");

class clientModel {
  constructor(db) {
    this.db = db || pool;
  }

  async findClientByEmail(email) {
    const query = "SELECT * FROM loyalty_card.clients WHERE email = $1";
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  async getClientById(clientId) {
    const query =
      "SELECT id, email, first_name, last_name, points, birth_date FROM loyalty_card.clients WHERE id = $1";
    const result = await this.db.query(query, [clientId]);
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

  async changePassword(clientId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = "UPDATE loyalty_card.clients SET password = $1 WHERE id = $2";
    await this.db.query(query, [hashedPassword, clientId]);
  }

  async updateClient(clientId, clientData) {
    const { email, first_name, last_name, birthday } = clientData;
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

    if (birthday) {
      updates.push("birth_date = $4");
      values.push(birthday);
    }

    if (values.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    values.push(clientId);
    const query = `UPDATE loyalty_card.clients SET ${updates.join(", ")} WHERE id = $${values.length}`;
    await this.db.query(query, values);
  }

  async verifyUserPassword(userPassword, hashedPassword) {
    if (!userPassword || !hashedPassword) {
      console.error("Invalid arguments passed to verifyUserPassword");
      return Promise.reject(new Error("Invalid arguments"));
    }
    return bcrypt.compare(userPassword, hashedPassword);
  }

  async getHashedPassword(clientId) {
    const query = "SELECT password FROM loyalty_card.clients WHERE id = $1";
    const result = await this.db.query(query, [clientId]);
    return result.rows[0].password;
  }

  async deleteClient(clientId) {
    const query = "DELETE FROM loyalty_card.clients WHERE id = $1";
    await this.db.query(query, [clientId]);
  }

  async getAllClients() {
    const query =
      "SELECT id, email, first_name, last_name, birth_date FROM loyalty_card.clients";
    const result = await this.db.query(query);

    // Sort clients by first name
    result.rows.sort((a, b) => {
      return a.first_name.localeCompare(b.first_name);
    });
    return result.rows;
  }

  async getPoints(clientId) {
    try {
      const query = "SELECT points FROM loyalty_card.clients WHERE id = $1";
      const result = await this.db.query(query, [clientId]);
      if (result.rows.length > 0) {
        return result.rows[0].points;
      } else {
        console.log("No client found with that ID.");
        return null;
      }
    } catch (error) {
      console.error("Error getting points:", error);
      throw error;
    }
  }

  async addPoints(clientId, pointsToAdd) {
    if (pointsToAdd <= 0) {
      throw new Error("Invalid points to add.");
    }

    const query =
      "UPDATE loyalty_card.clients SET points = points + $1 WHERE id = $2 RETURNING points;";
    try {
      const client = await this.db.query(
        "SELECT points FROM loyalty_card.clients WHERE id = $1",
        [clientId],
      );
      if (client.rows.length === 0) {
        throw new Error("Client not found.");
      }

      // Check if adding points would exceed the maximum safe integer limit
      const currentPoints = client.rows[0].points;
      if (currentPoints > Number.MAX_SAFE_INTEGER - pointsToAdd) {
        throw new Error(
          "Adding points would exceed the maximum safe integer limit.",
        );
      }

      const result = await this.db.query(query, [pointsToAdd, clientId]);
      if (result.rows.length > 0) {
        return result.rows[0].points;
      } else {
        throw new Error("Client not found.");
      }
    } catch (error) {
      console.error("Error updating client points:", error);
      throw error;
    }
  }

  async reduceGiftQuantity(giftId, quantity) {
    const query =
      "UPDATE loyalty_card.gifts SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING *;";
    try {
      const result = await this.db.query(query, [quantity, giftId]);
      if (result.rows.length === 0) {
        throw new Error("Insufficient quantity or gift not found.");
      }
    } catch (error) {
      console.error("Error reducing gift quantity:", error);
      throw error;
    }
  }

  async deductPoints(clientId, pointsToDeduct) {
    try {
      const query =
        "UPDATE loyalty_card.clients SET points = points - $1 WHERE id = $2 RETURNING points;";
      const result = await this.db.query(query, [pointsToDeduct, clientId]);
      if (result.rows.length > 0) {
        return result.rows[0].points;
      } else {
        throw new Error("Client not found.");
      }
    } catch (error) {
      console.error("Error updating client points:", error);
      throw error;
    }
  }

  async todayIsClientBirthday(clientId) {
    try {
      const query = "SELECT birth_date FROM loyalty_card.clients WHERE id = $1";
      const result = await this.db.query(query, [clientId]);
      if (result.rows.length > 0) {
        const birthDate = result.rows[0].birth_date;
        const today = new Date();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();
        return birthMonth === todayMonth && birthDay === todayDay;
      } else {
        throw new Error("Client not found.");
      }
    } catch (error) {
      console.error("Error checking if today is client's birthday:", error);
      throw error;
    }
  }

  async isBirthdayGiftAlreadyClaimed(clientId) {
    try {
      const query =
        "SELECT * FROM loyalty_card.transactions WHERE client_id = $1 AND is_birthday_gift = TRUE AND transaction_date = CURRENT_DATE";
      const result = await this.db.query(query, [clientId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(
        "Error checking if birthday gift is already claimed:",
        error,
      );
      throw error;
    }
  }
}

module.exports = clientModel;

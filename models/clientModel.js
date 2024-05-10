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

  async getClientById(clientId) {
    const query =
      "SELECT id, email, first_name, last_name, birth_date FROM loyalty_card.clients WHERE id = $1";
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

  async updateClient(clientId, clientData) {
    const { email, first_name, last_name, birth_date } = clientData;
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
    if (birth_date && birth_date.trim() !== "") {
      updates.push("birth_date = $4");
      values.push(birth_date);
    }

    if (values.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    values.push(clientId);
    const query = `update loyalty_card.clients set ${updates.join(
      ", ",
    )} where id = $${values.length}`;
    await this.db.query(query, values);
  }

  async verifyUserPassword(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
  }

  async deleteClient(clientId) {
    const query = "DELETE FROM loyalty_card.clients WHERE id = $1";
    await this.db.query(query, [clientId]);
  }

  async getAllClients() {
    const query =
      "SELECT id, email, first_name, last_name, birth_date FROM loyalty_card.clients";
    const result = await this.db.query(query);
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
        return null; // No client found
      }
    } catch (error) {
      console.error("Error getting points:", error);
      throw error;
    }
  }

  async addPoints(clientId, pointsToAdd) {
    const query =
      "UPDATE loyalty_card.clients SET points = points + $1 WHERE id = $2 RETURNING points;";
    try {
      const result = await this.db.query(query, [pointsToAdd, clientId]);
      if (result.rows.length > 0) {
        return result.rows[0].points; // Optionally return the new points total
      } else {
        throw new Error("Client not found.");
      }
    } catch (error) {
      console.error("Error updating client points:", error);
      throw error;
    }
  }
  async getAvailableGiftsBelowPoints(clientPoints) {
    try {
      const query = "SELECT * FROM loyalty_card.gifts WHERE needed_points <= $1";
      const { rows } = await this.db.query(query, [clientPoints]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching available gifts below client points: ${error}`);
    }
  }

  async getAvailableGifts() {
    const query = "SELECT * FROM loyalty_card.gifts";
    const result = await this.db.query(query);
    return result.rows;
  }

  async getProductById(productId) {
    const query = "SELECT * FROM loyalty_card.gifts WHERE id = $1";
    const result = await this.db.query(query, [productId]);
    return result.rows[0];
  }
  
  async getGiftById(giftId) {
      try {
          const query = "SELECT * FROM loyalty_card.gifts WHERE id = $1";
          const result = await this.db.query(query, [giftId]);
          if (result.rows.length > 0) {
              const gift = result.rows[0];
              const availableQuantity = gift.quantity; // Utilisez la colonne quantity pour obtenir le nombre disponible
              return { ...gift, availableQuantity };
          } else {
              throw new Error("Gift not found.");
          }
      } catch (error) {
          console.error("Error getting gift by ID:", error);
          throw error;
      }
  }

  async deductPoints(clientId, pointsToDeduct) {
    try {
        const query = "UPDATE loyalty_card.clients SET points = points - $1 WHERE id = $2 RETURNING points;";
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

}


module.exports = clientModel;
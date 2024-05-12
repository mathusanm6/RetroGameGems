class GiftModel {
  constructor(db) {
    this.db = db;
  }

  async getGiftById(giftId) {
    const query = "SELECT * FROM loyalty_card.gifts WHERE id = $1";
    const result = await this.db.query(query, [giftId]);
    return result.rows[0];
  }

  async getAllGiftsByIDS(giftIds) {
    // Check if the array is empty
    if (giftIds.length === 0) {
      return [];
    }

    const params = giftIds.map((_, index) => `$${index + 1}`).join(", ");
    const query = `SELECT * FROM loyalty_card.gifts WHERE id IN (${params})`;

    const result = await this.db.query(query, giftIds); // Passing giftIds as parameters
    return result.rows;
  }

  async getRandomGift() {
    const query = "SELECT * FROM loyalty_card.gifts ORDER BY random() LIMIT 1";
    const result = await this.db.query(query);
    return result.rows[0];
  }

  async getAllGifts() {
    const query = "SELECT * FROM loyalty_card.gifts";
    const result = await this.db.query(query);
    return result.rows;
  }

  async addGift(name, description, quantity, needed_points) {
    const query =
      "INSERT INTO loyalty_card.gifts (name, description, quantity, needed_points) VALUES ($1, $2, $3, $4)";
    await this.db.query(query, [name, description, quantity, needed_points]);
  }

  async updateGift(giftId, name, description, quantity, needed_points) {
    const query =
      "UPDATE loyalty_card.gifts SET name = $1, description = $2, quantity = $3, needed_points = $4 WHERE id = $5";
    await this.db.query(query, [
      name,
      description,
      quantity,
      needed_points,
      giftId,
    ]);
  }

  async deleteGift(giftId) {
    const query = "DELETE FROM loyalty_card.gifts WHERE id = $1";
    await this.db.query(query, [giftId]);
  }

  async getAvailableGiftsBelowPoints(clientPoints) {
    try {
      const query =
        "SELECT * FROM loyalty_card.gifts WHERE needed_points <= $1";
      const { rows } = await this.db.query(query, [clientPoints]);
      return rows;
    } catch (error) {
      throw new Error(
        `Error fetching available gifts below client points: ${error}`,
      );
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
}

module.exports = GiftModel;

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

    // Sort gifts by name
    result.rows.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return result.rows;
  }

  async addGift(giftData) {
    const { name, description, image, quantity, needed_points } = giftData;
    const query =
      "INSERT INTO loyalty_card.gifts (name, description, image, quantity, needed_points) VALUES ($1, $2, $3, $4, $5)";
    await this.db.query(query, [
      name,
      description,
      image,
      quantity,
      needed_points,
    ]);
  }

  async updateGift(giftId, giftData) {
    const { name, description, image, quantity, needed_points } = giftData;
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

    if (image) {
      updates.push("image = $3");
      values.push(image);
    }

    if (quantity) {
      updates.push("quantity = $4");
      values.push(quantity);
    }
    if (needed_points) {
      updates.push("needed_points = $5");
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

const express = require("express");
const bcrypt = require("bcryptjs");

module.exports = (db) => {
  const router = express.Router();

  // Login Route
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await db.query("SELECT * FROM loyalty_card.users WHERE username = $1", [
        username,
      ]);
      if (user.rows.length > 0) {
        const validPassword = await bcrypt.compare(
          password,
          user.rows[0].password
        );
        if (validPassword) {
          req.session.userId = user.rows[0].id;
          req.session.role = user.rows[0].role;
          res.redirect(
            req.session.role === "manager" ? "/manager" : "/dashboard"
          );
        } else {
          res.send("Invalid Username or Password");
        }
      } else {
        res.send("Invalid Username or Password");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

  // Manager creates a new customer account
  router.post("/create-user", async (req, res) => {
    if (req.session.role === "manager") {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        await db.query(
          "INSERT INTO loyalty_card.users (username, password, role) VALUES ($1, $2, $3)",
          [username, hashedPassword, "customer"]
        );
        res.send("User created successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  });

  return router;
};

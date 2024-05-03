const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Make sure to load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Using an environment variable for DB connection
});

const sqlFilePath = path.join(__dirname, "init_db.sql");
const sql = fs.readFileSync(sqlFilePath, { encoding: "UTF-8" });

pool.connect((err, client, done) => {
  if (err) throw err;

  client.query(sql, (err, res) => {
    done();
    if (err) {
      console.error("Error executing the SQL file:", err.stack);
    } else {
      console.log("Database has been successfully initialized");
    }
    pool.end(); // Close the pool
  });
});

async function createAdminUser(db) {
  const username = "admin";
  const password = "admin";
  const role = "manager";
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
    // Check if the admin user already exists
    const res = await db.query(
      "SELECT * FROM loyalty_card.users WHERE username = $1",
      [username]
    );
    if (res.rows.length === 0) {
      // Insert the new admin user if not existing
      await db.query(
        "INSERT INTO loyalty_card.users (username, password, role) VALUES ($1, $2, $3)",
        [username, hashedPassword, role]
      );
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (err) {
    console.error("Failed to create admin user:", err);
  }
}

createAdminUser(pool); // Call the function to create the admin user

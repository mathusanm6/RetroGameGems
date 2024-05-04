const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("./models/db");

const sqlFilePath = path.join(__dirname, "init_db.sql");
const sql = fs.readFileSync(sqlFilePath, { encoding: "UTF-8" });

// Function to create admin user
async function createAdminUser(db) {
  const email = "admin@example.com";
  const password = "admin";
  const firstName = "Admin";
  const lastName = "User";
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
    const res = await db.query(
      "SELECT * FROM loyalty_card.managers WHERE email = $1",
      [email]
    );
    if (res.rows.length === 0) {
      await db.query(
        "INSERT INTO loyalty_card.managers (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
        [firstName, lastName, email, hashedPassword]
      );
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (err) {
    console.error("Failed to create admin user:", err);
  } finally {
    db.end(); // Close the pool after creating the admin user
  }
}

// Connect to the pool and execute SQL file, then create admin user
pool.connect((err, client, done) => {
  if (err) throw err;

  client.query(sql, async (err, res) => {
    done(); // Release the client back to the pool
    if (err) {
      console.error("Error executing the SQL file:", err.stack);
      pool.end(); // Close the pool if there is an error
    } else {
      console.log("Database has been successfully initialized");
      await createAdminUser(pool);
    }
  });
});

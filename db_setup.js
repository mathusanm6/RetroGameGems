const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("./models/db");

const sqlFilePath = path.join(__dirname, "init_db.sql");
const sql = fs.readFileSync(sqlFilePath, { encoding: "UTF-8" });

const admins = [
  {
    email: "rtheo@mail.com",
    password: "theo",
    firstName: "Theo",
    lastName: "Raoul",
  },
  {
    email: "smathusan@mail.com",
    password: "mathusan",
    firstName: "Mathusan",
    lastName: "Selvakumar",
  },
];

const clients = [
  {
    email: "john.doe@mail.com",
    password: "john123",
    firstName: "John",
    lastName: "Doe",
    birthDate: "1990-01-01",
  },
  {
    email: "jane.smith@mail.com",
    password: "jane123",
    firstName: "Jane",
    lastName: "Smith",
    birthDate: "1992-02-02",
  },
  {
    email: "alice.jones@mail.com",
    password: "alice123",
    firstName: "Alice",
    lastName: "Jones",
    birthDate: "1988-03-03",
  },
  {
    email: "bob.brown@mail.com",
    password: "bob123",
    firstName: "Bob",
    lastName: "Brown",
    birthDate: "1991-04-04",
  },
  {
    email: "charlie.davis@mail.com",
    password: "charlie123",
    firstName: "Charlie",
    lastName: "Davis",
    birthDate: "1993-05-05",
  },
];

// Function to create admin user
async function createAdminUser(db, admins) {
  try {
    for (let i = 0; i < admins.length; i++) {
      const email = admins[i].email;
      const password = admins[i].password;
      const firstName = admins[i].firstName;
      const lastName = admins[i].lastName;
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const res = await db.query(
        "SELECT * FROM loyalty_card.managers WHERE email = $1",
        [email],
      );
      if (res.rows.length === 0) {
        await db.query(
          "INSERT INTO loyalty_card.managers (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
          [firstName, lastName, email, hashedPassword],
        );
        console.log("Admin user created:", email);
      } else {
        console.log("Admin user already exists:", email);
      }
    }
  } catch (err) {
    console.error("Failed to create admin user:", err);
  }
}

// Function to create client user
async function createClientUser(db, clients) {
  try {
    for (let i = 0; i < clients.length; i++) {
      const { email, password, firstName, lastName, birthDate } = clients[i];
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const res = await db.query(
        "SELECT * FROM loyalty_card.clients WHERE email = $1",
        [email],
      );
      if (res.rows.length === 0) {
        await db.query(
          "INSERT INTO loyalty_card.clients (first_name, last_name, email, password, birth_date) VALUES ($1, $2, $3, $4, $5)",
          [firstName, lastName, email, hashedPassword, birthDate],
        );
        console.log("Client user created:", email);
      } else {
        console.log("Client user already exists:", email);
      }
    }
  } catch (err) {
    console.error("Failed to create client user:", err);
  }
}

// Connect to the pool and execute SQL file, then create admin user
pool.connect((err, client, done) => {
  if (err) throw err;

  // eslint-disable-next-line no-unused-vars
  client.query(sql, async (err, res) => {
    done(); // Release the client back to the pool
    if (err) {
      console.error("Error executing the SQL file:", err.stack);
      pool.end(); // Close the pool if there is an error
    } else {
      console.log("Database has been successfully initialized");
      await createAdminUser(pool, admins);
      await createClientUser(pool, clients);
      pool.end(); // Close the pool
    }
  });
});

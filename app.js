require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

const app = express();
const port = 3000;

const dbParams = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
};

const dbPool = new Pool(dbParams);

app.use(
  session({
    store: new pgSession({
      pool: dbPool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: "development",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  }),
);

// Set EJS as templating engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Index route
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// Auth routes
const authRouter = require("./routes/login/login")(dbPool);
app.use(authRouter);

// Client dashboard routes
const clientDashboardRouter = require("./routes/dashboard/client");
app.use(clientDashboardRouter);

// Manager dashboard routes
const managerDashboardRouter = require("./routes/dashboard/manager");
app.use(managerDashboardRouter);

// Redirect to login page if no route is matched unless user is logged in
// This should be the last route
app.get("*", (req, res) => {
  if (req.session.userId) {
    if (req.session.role === "manager") {
      res.redirect("/manager-dashboard");
    } else if (req.session.role === "client") {
      res.redirect("/client-dashboard");
    }
  } else {
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

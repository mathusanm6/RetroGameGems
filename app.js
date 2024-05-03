require("dotenv").config();
const HttpStatus = require("http-status-codes");
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
  })
);

// Set EJS as templating engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware for route protection
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isManager(req, res, next) {
  if (req.session.role === "manager") {
    next();
  } else {
    res.status(HttpStatus.StatusCodes.FORBIDDEN).send("Unauthorized");
  }
}

// Apply middleware
app.use("/manager", isLoggedIn, isManager);
app.use("/dashboard", isLoggedIn);

// Routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const authRouter = require("./routes/auth")(dbPool);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

// Set EJS as templating engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

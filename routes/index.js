const express = require("express");
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  if (req.session.userId) {
    // Redirect based on user role
    if (req.session.role === "manager") {
      res.redirect("/manager-dashboard");
    } else if (req.session.role === "client") {
      res.redirect("/client-dashboard");
    }
  } else {
    res.render("index");
  }
});

module.exports = router;

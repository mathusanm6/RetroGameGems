const express = require("express");
const router = express.Router();

// Home route or landing page
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

// Specific login routes for client and manager
router.get("/auth/client-login", (req, res) => {
  // Directly render the client login page
  if (req.session.userId && req.session.role === "client") {
    res.redirect("/client-dashboard");
  } else if (req.session.userId && req.session.role === "manager") {
    res.redirect("/manager-dashboard");
  } else {
    res.render("clientLogin");
  }
});

router.get("/auth/manager-login", (req, res) => {
  // Directly render the manager login page
  if (req.session.userId && req.session.role === "manager") {
    res.redirect("/manager-dashboard");
  } else if (req.session.userId && req.session.role === "client") {
    res.redirect("/client-dashboard");
  } else {
    res.render("managerLogin");
  }
});

module.exports = router;

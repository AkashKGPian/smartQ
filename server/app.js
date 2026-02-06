const express = require("express");

const app = express();

// basic middleware
app.use(express.json());//Adds JSON/body parsing
app.use(express.urlencoded({ extended: true }));//Adds URL-encoded parsing

// test route
app.get("/", (req, res) => {
  res.send("SmartQ server is running!");
});

module.exports = app;

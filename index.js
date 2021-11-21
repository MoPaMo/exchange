const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mustache = require("mustache");
const dotenv = require('dotenv').config();
const path = require('path');
const fs = require("fs");

var app = express();
app.use(session({
  secret: process.env.session_pwd,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))

const renderFile = function(path, data, cb) {
  fs.readFile(path, (err, buff) => {
    // if any error
    if (err) {
      console.log(err);
      return;
    } else {
      //console.log(buff);
      let text = buff.toString();
      //console.log(text);
      cb(mustache.render(text, data));
    }
  });
};

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});
app.get("/item/:id", (req, res) => {
  res.sendFile(`${__dirname}/views/item.html`);

});
app.listen(3000);

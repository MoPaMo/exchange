const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mustache = require("mustache");
const nodemailer = require('nodemailer');
const sqlite3 = require("sqlite3").verbose();
const dotenv = require('dotenv').config();
const path = require('path');
const fs = require("fs");
const {
  customAlphabet
} = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.emailPwd
  }
});

// open the database
var dberror = false;
let db = new sqlite3.Database("./db/db.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
    dberror = err.message;
  }
  console.log("Connected to the database.");
});

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
app.get("/signin", (req, res) => {
  if (!req.session.logged_in) { //not logged in
    res.sendFile(`${__dirname}/views/signin.html`);
  } else { //already logged in, redirect to
    res.redirect((req.query.continue ? req.query.continue : "/"))
  }
});
app.get("/register", (req, res) => {
  res.sendFile(`${__dirname}/views/register.html`);
});
app.post("/register", (req, res) => {
  if (!req.session.logged_in) { //not logged in
    if (!!req.body.pwd && !!req.body.email&&!!req.body.name) {
      if (req.body.email.match(/^[a-zA-Z0-9_.+]+@ksth\.schulerzbistum\.de+$/)) {
        req.session.logging_in = true;
        req.session.pwd = req.body.pwd;
        req.session.email = req.body.email;
        req.session.name=req.body.name;
        res.redirect("/code");
      } else { // no valid email
        res.redirect(req.originalUrl);
      }
    }
  } else { //already logged in, redirect to
    res.redirect((req.query.continue ? req.query.continue : "/"))
  }
})
app.get("/code", (req, res) => {
  if (!req.session.logged_in) {
    if (req.session.logging_in) {
      let secret = nanoid();
      req.session.secret = secret;


      let mailOptions = {
        from: process.env.email,
        to: req.session.email,
        subject: 'Aktiviere deinen Account',
        text: 'Dein Bestätigungscode lautet ' + secret
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.sendFile(`${__dirname}/views/code.html`);
    } else {
      res.redirect("/register")
    }
  } else {
    res.redirect("/")
  }
})
app.post("/code", (req, res) => {
  if (!req.session.logged_in) {
    if (req.session.logging_in) {
      if (req.session.secret == req.body.code) {
        res.send("success:")
      } else {
        res.redirect("/code")
      }
    } else {
      res.redirect("/login")
    }
  } else {
    res.redirect("/")
  }
})
app.listen(3000);
process.on('SIGINT', () => {
  console.log("Closing DB, server")
    db.close();
    app.close();
    console.log("Finished!")
});

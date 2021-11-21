const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
var app =express();
app.use(session({
	secret: process.env.session_pwd,
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});
app.listen(3000);
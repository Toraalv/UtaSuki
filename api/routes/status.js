"use strict"

const sendStatus = require("../helpers.js").sendStatus;

const express = require("express");
const app = express();

module.exports = app.get('/', (req, res) => {
	sendStatus(req, res, 200, "success.status_ok");
});


"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();

module.exports = app.post('/', upload.none(), (req, res) => {
	if (!req.authed) {
		dbQuery("UPDATE users SET auth_token = NULL WHERE uid = ?", [req.uid]);
		sendStatus(req, res, 200, "success.logout");
	} else
		sendStatus(req, res, 404, "error.not_logged_in");
});


"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get('/', async (req, res) => {
	let users = await dbQuery("SELECT uid, username, created, image, image_ver, last_activity FROM users NATURAL JOIN user_settings WHERE public IS TRUE");

	if (users.length == 0) {
		sendStatus(req, res, 200, "info.no_users", []);
		return;
	}

	sendStatus(req, res, 200, "success.users_found", users);
});


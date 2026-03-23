"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get('/', async (req, res) => {
	let users = await dbQuery("SELECT uid, username, created, image, image_ver, last_activity, public FROM users NATURAL JOIN user_settings");

	if (users.length == 0) {
		sendStatus(req, res, 200, "info.no_users", []);
		return;
	}

	if (!req.admin)
		for (let i = 0; i < users.length; i++)
			if (!users[i].public) {
				users.splice(i, 1);
				i--;
			}

	sendStatus(req, res, 200, "success.users_found", users);
});


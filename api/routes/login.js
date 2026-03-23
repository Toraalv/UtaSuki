"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

module.exports = app.post('/', upload.none(), async (req, res) => {
	const Token = (uid, email) => { return jwt.sign({ uid, email }, TOKEN_SECRET, { expiresIn: '36h' }); }

	let email = req.body.email;
	let password = req.body.password;

	// makes sure that every field is filled
	if ([email, password].includes(undefined)) {
		sendStatus(req, res, 400, "error.fields_not_specified");
		return;
	}

	// check login/register attempts
	let checkAttempts = await dbQuery("SELECT ip FROM logins WHERE ip = ?", [req.body.requestOrigin]);
	if (checkAttempts.length > 4) {
		sendStatus(req, res, 429, "warning.too_many_login_attempts");
		return;
	}

	// does the user exist?
	let userInfo = await dbQuery("SELECT uid, password FROM users WHERE email = ?", [email]);
	if (!userInfo.length) {
		await dbQuery("INSERT INTO logins (ip) VALUES (?)", [req.body.requestOrigin]);
		sendStatus(req, res, 418, "error.login_general");
		return;
	}

	// is the password correct?
	if (await bcrypt.compare(password, userInfo[0].password)) {
		let userToken = Token(userInfo[0].uid, email);
		await dbQuery("UPDATE users SET auth_token = ? WHERE uid = ?", [userToken, userInfo[0].uid]);
		let userSettings = await dbQuery("SELECT language, border_radius, body_margin, accent, accent_text, animations, opacity, blur FROM user_settings WHERE uid = ?;", [userInfo[0].uid]);
		sendStatus(req, res, 200, "success.login_success", { token: userToken, settings: userSettings[0] });
		return;
	} else {
		await dbQuery("INSERT INTO logins (ip) VALUES (?)", [req.body.requestOrigin]);
		sendStatus(req, res, 418, "error.login_general");
		return;
	}
});


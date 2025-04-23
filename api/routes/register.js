"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

module.exports = app.post('/', upload.single("file"), async (req, res) => {
	if (req.file == undefined) {
		sendStatus(req, res, 400, "error.no_image");
		return
	}

	let email = req.body.email;
	let username = req.body.username;
	let password = req.body.password;

	if ([email, username, password].includes(undefined)) {
		sendStatus(req, res, 400, "error.fields_not_specified");
		return;
	}

	let userExist = await dbQuery("SELECT 1 FROM users WHERE email = ?", [email]);
	if (userExist.length) {
		fs.rm(req.file.path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return } });
		sendStatus(req, res, 418, "error.user_email_exists");
		return;
	}

	let createUser;
	try  {
		const salt = await bcrypt.genSalt(10);
		password = await bcrypt.hash(password, salt);
		createUser = await dbQuery("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [email, username, password]);
	} catch (e) {
		fs.rm(req.file.path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return } });
		sendStatus(req, res, 500, "error.create_user");
		return;
	}

	// add image after user creation so we can link uid instead
	const filename = createUser.insertId + path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, "../public/images/profile_pictures/" + filename);
	// bug or appropriate behaviour? even though picture may fail, user still gets created
	fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return } });

	let userPicture = await dbQuery("UPDATE users SET image = ? WHERE uid = ?", ["/static/images/profile_pictures/" + filename, createUser.insertId]);

	sendStatus(req, res, 200, "success.user_created");
});


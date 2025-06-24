"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

module.exports = app.post('/', upload.single("profile_picture"), async (req, res) => {
	// only time this happens is when an user's auth token expires, as they try to change their settings
	if (!req.authed) {
		sendStatus(req, res, 401, "error.forbidden");
		return;
	}

	let change = false;
	// update name
	let username = req.body.userhandle;
	if (username != undefined && username != '' && username != req.profile.username) {
		try {
			await dbQuery("UPDATE users SET username = ? WHERE uid = ?", [username, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_username");
			return;
		}
	}

	// update password. should this invalidate auth token?
	let password = req.body.password;
	if (password != undefined && password != '') {
		try {
			const salt = await bcrypt.genSalt(10);
			password = await bcrypt.hash(password, salt);
			await dbQuery("UPDATE users SET password = ? WHERE uid = ?", [password, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_password");
			return;
		}
	}

	// update profile picture
	if (req.file != undefined) {
		try {
			const filename = req.profile.uid + path.extname(req.file.originalname).toLowerCase();
			const targetPath = path.join(__dirname, "../public/images/profile_pictures/" + filename);
			fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });

			await dbQuery("UPDATE users SET image = ?, image_ver = ? WHERE uid = ?", ["/static/images/profile_pictures/" + filename, req.profile.image_ver + 1, req.profile.uid]);
			change = true;
		} catch (e) {
			fs.rm(req.file.path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
			sendStatus(req, res, 500, "error.update_profile_picture");
			return;
		}
	}

	// update public setting
	let isPublic = req.body.public == "on" ? 1 : 0;
	if (isPublic != req.profile.public) {
		try {
			await dbQuery("UPDATE users SET public = ? WHERE uid = ?", [isPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}
	// update track notes public setting
	let isTrackNotesPublic = req.body.track_notes_public == "on" ? 1 : 0;
	if (isTrackNotesPublic != req.profile.track_notes_public) {
		try {
			await dbQuery("UPDATE users SET track_notes_public = ? WHERE uid = ?", [isTrackNotesPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}

	// language
	if (req.body.language && req.body.language != req.profile.language) {
		try {
			await dbQuery("UPDATE users SET language = ? WHERE uid = ?", [req.body.language, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_lang");
			return;
		}
	}

	let borderRadius = req.body.border_radius == "on" ? 8 : 0;
	if (borderRadius != req.profile.border_radius) {
		try {
			await dbQuery("UPDATE users SET border_radius = ? WHERE uid = ?", [borderRadius, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_border_radius");
			return;
		}
	}

	if (change) {
		sendStatus(req, res, 200, "success.updated_settings");
		// update last_activity
		await dbQuery("UPDATE users SET last_activity = current_timestamp() WHERE uid = ?", [req.profile.uid]);
	} else
		sendStatus(req, res, 200, "info.no_change");
});


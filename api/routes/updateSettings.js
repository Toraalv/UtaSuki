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
	let isPublic = req.body.public;
	if (isPublic != undefined && isPublic != req.profile.public) {
		try {
			await dbQuery("UPDATE user_settings SET public = ? WHERE uid = ?", [isPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}
	// update track notes public setting
	let isTrackNotesPublic = req.body.notes_public;
	if (isTrackNotesPublic != undefined && isTrackNotesPublic != req.profile.notes_public) {
		try {
			await dbQuery("UPDATE user_settings SET notes_public = ? WHERE uid = ?", [isTrackNotesPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}

	// language
	if (req.body.language != undefined && req.body.language != req.profile.language) {
		try {
			await dbQuery("UPDATE user_settings SET language = ? WHERE uid = ?", [req.body.language, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_lang");
			return;
		}
	}

	// border_radius
	let borderRadius = req.body.border_radius;
	if (borderRadius != undefined && borderRadius != req.profile.border_radius) {
		try {
			await dbQuery("UPDATE user_settings SET border_radius = ? WHERE uid = ?", [borderRadius, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_border_radius");
			return;
		}
	}

	// body_margin
	let bodyMargin = req.body.body_margin;
	if (bodyMargin != undefined && bodyMargin != req.profile.body_margin) {
		try {
			await dbQuery("UPDATE user_settings SET body_margin = ? WHERE uid = ?", [bodyMargin, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_body_margin");
			return;
		}
	}

	// animations
	let animations = req.body.animations;
	if (animations != undefined && animations != req.profile.animations) {
		try {
			await dbQuery("UPDATE user_settings SET animations = ? WHERE uid = ?", [animations, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_animations");
			return;
		}
	}

	// update accent colour
	let accent = req.body.accent;
	if (accent != undefined && accent != req.profile.accent) {
		try {
			await dbQuery("UPDATE user_settings SET accent = ? WHERE uid = ?", [accent, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_accent");
			return;
		}
	}

	// update accent text colour
	let accentText = req.body.accent_text;
	if (accentText != undefined && accentText != req.profile.accent_text) {
		try {
			await dbQuery("UPDATE user_settings SET accent_text = ? WHERE uid = ?", [accentText, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_accent_text");
			return;
		}
	}

	if (change)
		sendStatus(req, res, 200, "success.updated_settings");
	else
		sendStatus(req, res, 200, "info.no_change");
});


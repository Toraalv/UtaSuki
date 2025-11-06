"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

module.exports = app.post('/', upload.fields([{ name: "profile_picture" }, { name: "background_img" }]), async (req, res) => {
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

	// update background image
	if (req.body.remove_bkg == "false") {
		if (req.files.background_img != undefined) {
			try {
				const filename = req.profile.uid + path.extname(req.files.background_img[0].originalname).toLowerCase();
				const targetPath = path.join(__dirname, "../public/images/backgrounds/" + filename);
				fs.rename(req.files.background_img[0].path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });

				await dbQuery("UPDATE user_settings SET bkg = ?, bkg_ver = ? WHERE uid = ?", ["/static/images/backgrounds/" + filename, req.profile.bkg_ver + 1, req.profile.uid]);
				change = true;
			} catch (e) {
				console.log(e);
				fs.rm(req.files.background_img[0].path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
				sendStatus(req, res, 500, "error.update_background_img");
				return;
			}
		}
	} else if (req.body.remove_bkg != undefined) {
		try {
			await dbQuery("UPDATE user_settings SET bkg = NULL WHERE uid = ?", [req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.remove_background_img");
			return;
		}
	}

	// update opacity
	if (req.body.opacity != undefined && req.body.opacity != req.profile.opacity) {
		try {
			await dbQuery("UPDATE user_settings SET opacity = ? WHERE uid = ?", [req.body.opacity, req.profile.uid]);
			if (req.body.opacity >= 85)
				await dbQuery("UPDATE user_settings SET nav_opacity = ? WHERE uid = ?", [req.body.opacity, req.profile.uid]);
			else
				await dbQuery("UPDATE user_settings SET nav_opacity = ? WHERE uid = ?", [85, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_opacity");
			return;
		}
	}


	// update profile picture
	if (req.files.profile_picture != undefined) {
		try {
			const filename = req.profile.uid + path.extname(req.files.profile_picture[0].originalname).toLowerCase();
			const targetPath = path.join(__dirname, "../public/images/profile_pictures/" + filename);
			fs.rename(req.files.profile_picture[0].path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });

			await dbQuery("UPDATE users SET image = ?, image_ver = ? WHERE uid = ?", ["/static/images/profile_pictures/" + filename, req.profile.image_ver + 1, req.profile.uid]);
			change = true;
		} catch (e) {
			fs.rm(req.files.profile_picture[0].path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
			sendStatus(req, res, 500, "error.update_profile_picture");
			return;
		}
	}

	// update public setting
	if (req.body.public != undefined && req.body.public != req.profile.public) {
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


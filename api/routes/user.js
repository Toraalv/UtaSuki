"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get("/:uid", async (req, res) => {
	let uid = req.params.uid;
	
	let profile = await dbQuery("SELECT uid, username, image, image_ver, public, accent, accent_text, bkg, bkg_ver, opacity, blur FROM users NATURAL JOIN user_settings WHERE uid = ?", [uid]);
	if (!profile.length) {
		sendStatus(req, res, 404, "error.user_not_exist")
		return;
	}

	if (!profile[0].public && uid != req.profile?.uid && !req.admin) {
		sendStatus(req, res, 403, "error.user_private");
		return;
	}

	let data = await dbQuery("SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE users.uid = ? ORDER BY date", [uid]);

	// if user has any tracks
	if (data.length == 0) {
		sendStatus(req, res, 200, "info.user_no_tracks", {profile: profile[0], undefined, totalTracks: 0});
		return;
	}

	let totalTracks = data.length;

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // extracts unique years, 凄い

	sendStatus(req, res, 200, "success.years_found", {profile: profile[0], years: years, totalTracks: totalTracks});
});


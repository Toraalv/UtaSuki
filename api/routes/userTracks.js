"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get("/:uid/tracks", async (req, res) => {
	let uid = req.params.uid;

	let userExist = await dbQuery("SELECT public FROM user_settings WHERE uid = ?", [uid]);
	if (!userExist.length) {
		sendStatus(req, res, 404, "error.user_not_exist");
		return;
	}

	if (!userExist[0].public && uid != req.profile?.uid && !req.admin) {
		sendStatus(req, res, 403, "error.user_private");
		return;
	}
	
	let data = await dbQuery(`
			SELECT
				user_tracks.id,
				date,
				artist,
				album,
				title,
				released,
				tracks.image,
				tracks.image_ver,
				notes,
				last_edit,
				notes_public
			FROM user_tracks
			JOIN tracks
			ON tracks.id = track_id
			JOIN users
			ON users.uid = user_tracks.uid
			JOIN user_settings
			ON user_settings.uid = users.uid
			WHERE users.uid = ?`, [uid]
	);

	if (data.length == 0) {
		sendStatus(req, res, 404, "warning.no_tracks_year");
		return;
	}

	if (!req.admin)
		for (let i = 0; i < data.length; i++)
			data[i].notes = "";

	sendStatus(req, res, 200, "success.tracks_found", data);
});


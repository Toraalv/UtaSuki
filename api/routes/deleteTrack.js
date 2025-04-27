"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();

module.exports = app.post('/', upload.none(), async (req, res) => {
	let trackOwnership = (await dbQuery("SELECT 1 FROM user_tracks JOIN users ON user_tracks.uid = users.uid WHERE users.uid = ? AND id = ?", [req.profile.uid, req.body.id])).length;
	if (!trackOwnership) {
		sendStatus(req, res, 404, "error.no_track_ownership");
		return;
	}

	let db_res = await dbQuery("DELETE FROM user_tracks WHERE id = ?", [req.body.id]);
	// todo: remove from tracks too, and image, if there is no one else who uses that track
	console.log(db_res);

	sendStatus(req, res, 200, "success.status_ok");
});


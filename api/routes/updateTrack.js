"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;
const IMAGE_PATH = require("../globals.js").IMAGE_PATH;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

module.exports = app.post('/', upload.single("album_cover"), async (req, res) => {
	// what if multiple users share the same track? pseudo code:
	// 1. check if that is the case
	// 2. copy that row
	// 3. take the id of that row, change old id in user_tracks
	// 4. continue to update track
	
	let trackToUpdate = await dbQuery("SELECT id, track_id FROM user_tracks JOIN users ON user_tracks.uid = users.uid WHERE users.uid = ? AND id = ?", [req.profile.uid, req.body.id]);
	if (!trackToUpdate.length) {
		sendStatus(req, res, 404, "error.no_track_ownership");
		return;
	}

	await dbQuery("UPDATE tracks SET artist = ?, title = ? WHERE id = ?", [req.body.artist, req.body.title, trackToUpdate[0].track_id]);
	await dbQuery("UPDATE user_tracks SET notes = ?, last_edit = NOW() WHERE id = ?", [req.body.notes, trackToUpdate[0].id]);

	sendStatus(req, res, 200, "success.status_ok");
});


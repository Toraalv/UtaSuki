"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;
const IMAGE_PATH = require("../globals.js").IMAGE_PATH;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

module.exports = app.post('/', upload.none(), async (req, res) => {
	let userTrackToDelete = await dbQuery("SELECT id, track_id FROM user_tracks JOIN users ON user_tracks.uid = users.uid WHERE users.uid = ? AND id = ?", [req.profile.uid, req.body.id]);
	if (!userTrackToDelete.length) {
		sendStatus(req, res, 404, "error.no_track_ownership");
		return;
	}
	let deletion = await dbQuery("DELETE FROM user_tracks WHERE id = ?", [userTrackToDelete[0].id]);

	sendStatus(req, res, 200, "success.deletion_ok");

	let isTrackPopulated = (await dbQuery("SELECT 1 FROM user_tracks WHERE track_id = ?", [userTrackToDelete[0].track_id])).length;
	// delete track (and image) if no else uses it
	if (!isTrackPopulated) {
		let track = await dbQuery("SELECT id, image FROM tracks WHERE id = ?", [userTrackToDelete[0].track_id]);
		let trackToDelete = await dbQuery("DELETE FROM tracks WHERE id = ?", [track[0].id]);
		fs.rm(path.join(__dirname, IMAGE_PATH + "album_covers/" + track[0].image), e => { if (e) console.log(e)});
	}
});


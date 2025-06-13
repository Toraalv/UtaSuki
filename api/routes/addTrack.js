"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const cyrb53 = require("../helpers.js").cyrb53;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;
const IMAGE_PATH = require("../globals.js").IMAGE_PATH;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

module.exports = app.post('/', upload.single("file"), async (req, res) => {
	if (req.file == undefined) {
		sendStatus(req, res, 400, "error.no_image");
		return
	}

	const handleError = (status, code, trackInsert) => {
		// removes the track if something failed
		if (trackInsert)
			dbQuery("DELETE FROM tracks WHERE id = ?;", [trackInsert.insertId]);

		fs.rm(req.file.path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
		sendStatus(req, res, status, code);
	}

	if (!req.authed) {
		handleError(401, "error.forbidden");
		return;
	}

	let uid = req.profile.uid;
	let artist = req.body.artist;
	let album = req.body.album;
	let title = req.body.title;
	let date = `${req.body.year}-${req.body.month}-15`;
	//let released = req.body.released;
	let released = "0000-00-00";
	let notes = req.body.notes;

	// makes sure that every field is filled and correct
	if ([uid, artist, album, title, req.body.year, req.body.month].map((obj) => obj == undefined || obj == '').includes(true)) {
		handleError(400, "error.add_track_fields_not_specified");
		return;
	}
	if (typeof(req.body.year) == "number" && req.body.month > 0 && req.body.month < 13) {
		handleError(400, "error.add_track_fields_not_specified");
		return;
	}
	if ([artist, encodeURIComponent(album) + ".jpeg", title].map((obj) => obj.length > 255).includes(true) || notes.length > 1024) {
		handleError(400, "error.field_too_long");
		return;
	}

	let trackExist = await dbQuery("SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?", [artist, album, title]);
	
	let userTrackInsert, trackInsert;
	if (trackExist.length) { // if track already exists, only add to user_tracks, otherwise both tracks and user_tracks
		try {
			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackExist[0].id, date, notes]);
			fs.rm(req.file.path, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
		} catch (e) {
			handleError(418, "error.track_already_added");
			return;
		}
	}
	else {
		try {
			trackInsert = await dbQuery(`
				INSERT INTO tracks (
					artist,
					album,
					title,
					released
				)
				VALUES (?, ?, ?, ?)`,
				[
					artist,
					album,
					title,
					released
				]
			);
			const filename = cyrb53(title + album + artist + trackInsert.insertId) + path.extname(req.file.originalname).toLowerCase();
			const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
			fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
			await dbQuery("UPDATE tracks SET image = ? WHERE id = ?", [filename, trackInsert.insertId]);

			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackInsert.insertId, date, notes]);
		} catch (e) {
			console.log(e);
			handleError(500, "error.add_track", trackInsert, userTrackInsert);
			return;
		}
	}

	sendStatus(req, res, 200, "success.add_track");

	// update last_activity
	await dbQuery("UPDATE users SET last_activity = current_timestamp() WHERE uid = ?", [uid]);
});


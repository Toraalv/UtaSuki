"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;
const IMAGE_PATH = require("../globals.js").IMAGE_PATH;

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// credit goes to bryc (github.com/bryc)
const cyrb53 = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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

	//const filename = encodeURIComponent(album) + path.extname(req.file.originalname).toLowerCase();
	const filename = cyrb53(title + album + artist) + path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
	
	let trackExist = await dbQuery("SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?", [artist, album, title]);
	
	let userTrackInsert, trackInsert;
	if (trackExist.length) { // if track already exists, only add to user_tracks, otherwise both tracks and user_tracks
		try {
			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackExist[0].id, date, notes]);
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
					released,
					image
				)
				VALUES (?, ?, ?, ?, ?)`,
				[
					artist,
					album,
					title,
					released,
					filename
				]
			);
			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackInsert.insertId, date, notes]);
		} catch (e) {
			console.log(e);
			handleError(500, "error.add_track", trackInsert, userTrackInsert);
			return;
		}
	}

	// update last_activity
	try {
		let userUpdateActivity = await dbQuery("UPDATE users SET last_activity = current_timestamp() WHERE uid = ?", [uid]);
	} catch (e) {
		handleError(500, "error.user_activity", trackInsert, userTrackInsert);
		return;
	}

	fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });

	sendStatus(req, res, 200, "success.add_track");
});


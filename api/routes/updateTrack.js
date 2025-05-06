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
	const title = req.body.title;
	const album = req.body.album;
	const artist = req.body.artist;
	const notes = req.body.notes;
	// what if multiple users share the same track? pseudo code:
	// 1. check if that is the case
	// 2. copy that row
	// 3. take the id of that row, change old id in user_tracks
	// 4. continue to update track
	const trackToUpdate = await dbQuery("SELECT id, track_id FROM user_tracks JOIN users ON user_tracks.uid = users.uid WHERE users.uid = ? AND id = ?", [req.profile.uid, req.body.id]);
	if (!trackToUpdate.length) {
		sendStatus(req, res, 404, "error.no_track_ownership");
		return;
	}

	const trackPopulation = (await dbQuery("SELECT * FROM user_tracks WHERE track_id = ?", [trackToUpdate[0].track_id])).length;
	if (trackPopulation > 1) {
		console.log("asd");
		const copyTrack = await dbQuery("INSERT INTO tracks (artist, album, title, released, image) SELECT ?, ?, ?, released, ? FROM tracks WHERE id = ?", [artist, album, title, ])
	}

	await dbQuery("UPDATE tracks SET artist = ?, album = ?, title = ? WHERE id = ?", [artist, album, title, trackToUpdate[0].track_id]);
	await dbQuery("UPDATE user_tracks SET notes = ?, last_edit = NOW() WHERE id = ?", [notes, trackToUpdate[0].id]);

	if (req.file != undefined) {
		const oldCover = (await dbQuery("SELECT image FROM tracks WHERE id = ?", [trackToUpdate[0].track_id]))[0].image;
		fs.rm(path.join(__dirname, IMAGE_PATH + "album_covers/" + oldCover), e => { if (e) console.log(e)});

		const filename = cyrb53(title + album + artist) + path.extname(req.file.originalname).toLowerCase();
		const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
		fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
		await dbQuery("UPDATE tracks SET image = ? WHERE id = ?", [filename, trackToUpdate[0].track_id]);
	}

	sendStatus(req, res, 200, "success.status_ok");
});


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
	const trackToUpdate = (await dbQuery("SELECT user_tracks.id AS id, track_id, tracks.image_ver FROM user_tracks JOIN users ON user_tracks.uid = users.uid JOIN tracks ON tracks.id = user_tracks.track_id WHERE users.uid = ? AND user_tracks.id = ?", [req.profile.uid, req.body.id]))[0];
	if (trackToUpdate == undefined) {
		sendStatus(req, res, 404, "error.no_track_ownership");
		return;
	}

	if ([artist, album, title].map((obj) => obj.length > 1024).includes(true) || notes.length > 1024) {
		sendStatus(req, res, 400, "error.field_too_long");
		return;
	}

	const oldCoverPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + (await dbQuery("SELECT image FROM tracks WHERE id = ?", [trackToUpdate.track_id]))[0].image);

	// only check if other people (i.e. not self) uses the track
	// IF true, copy track, otherwise edit
	const trackPopulation = (await dbQuery("SELECT * FROM user_tracks WHERE track_id = ? AND uid != ?", [trackToUpdate.track_id, req.profile.uid])).length;
	if (trackPopulation > 0) {
		const copyTrack = await dbQuery("INSERT INTO tracks (artist, album, title, released, image) SELECT ?, ?, ?, released, image FROM tracks WHERE id = ?", [artist, album, title, trackToUpdate.track_id]);
		await dbQuery("UPDATE user_tracks SET track_id = ? WHERE track_id = ? AND uid = ?", [copyTrack.insertId, trackToUpdate.track_id, req.profile.uid]);
		if (req.file != undefined) {
			const filename = cyrb53(title + album + artist + copyTrack.insertId) + path.extname(req.file.originalname).toLowerCase();
			const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
			fs.rename(req.file.path, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_upload"); return; } });
			await dbQuery("UPDATE tracks SET image = ?, image_ver = 1 WHERE id = ?", [filename, copyTrack.insertId]);
		} else {
			const filename = cyrb53(title + album + artist + copyTrack.insertId) + path.extname(oldCoverPath).toLowerCase();
			const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
			fs.copyFile(oldCoverPath, targetPath, e => { if (e) { sendStatus(req, res, 500, "error.file_copy"); return; } });
			await dbQuery("UPDATE tracks SET image = ? WHERE id = ?", [filename, copyTrack.insertId]);
		}
	} else {
		await dbQuery("UPDATE tracks SET artist = ?, album = ?, title = ? WHERE id = ?", [artist, album, title, trackToUpdate.track_id]);
		await dbQuery("UPDATE user_tracks SET notes = ?, last_edit = NOW() WHERE id = ?", [notes, trackToUpdate.id]);

		if (req.file != undefined) {
			const filename = cyrb53(title + album + artist + trackToUpdate.track_id) + path.extname(req.file.originalname).toLowerCase();
			const targetPath = path.join(__dirname, IMAGE_PATH + "album_covers/" + filename);
			fs.rename(req.file.path, targetPath, e => { if (e) { console.log(e); return; } });
			await dbQuery("UPDATE tracks SET image = ?, image_ver = ? WHERE id = ?", [filename, ++trackToUpdate.image_ver, trackToUpdate.track_id]);

			// only delete old cover if no one else uses it
			if ((await dbQuery("SELECT * FROM user_tracks WHERE track_id = ?", [trackToUpdate.track_id])).length)
				if (oldCoverPath != targetPath) // ...and only if the path is not identical
					fs.rm(oldCoverPath, e => { if (e) console.log(e)});
		}
	}
	sendStatus(req, res, 200, "success.status_ok");

	// update last_activity
	await dbQuery("UPDATE users SET last_activity = current_timestamp() WHERE uid = ?", [req.profile.uid]);
});


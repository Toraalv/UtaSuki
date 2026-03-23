"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get("/:uid/tracks/:year", async (req, res) => {
	let uid = req.params.uid;
	let year = req.params.year;

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
			WHERE users.uid = ?
				AND date >= ?
					AND date < ?;`,
		[
			uid,
			`${year}-01-01`,
			`${Number(year) + 1}-01-01`,
		]);

	if (data.length == 0) {
		sendStatus(req, res, 404, "warning.no_tracks_year");
		return;
	}

	// I'll leave this here for memories sake
	//let monthTracks = [[], [], [], [], [], [], [], [], [], [], [], []];
	//let monthTracks = new Array(12).fill([]);
	let monthTracks = new Array(12).fill(null).map(() => []);

	for (let i = 0; i < data.length; i++) {
		monthTracks[data[i].date.getMonth()].push({
			id: data[i].id,
			artist: data[i].artist,
			album: data[i].album,
			title: data[i].title,
			released: data[i].released,
			image: data[i].image,
			image_ver: data[i].image_ver,
			notes: uid == req.profile?.uid || req.admin ? data[i].notes : data[i].notes_public && data[i].notes,
			last_edit: data[i].notes_public && data[i].last_edit,
		});
	}

	sendStatus(req, res, 200, "success.tracks_found", monthTracks);
});


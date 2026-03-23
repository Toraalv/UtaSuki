"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;
const { PFP_PATH, ALBUM_PATH, BG_PATH } = require("../globals.js");

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

module.exports = app.post('/', upload.none(), async (req, res) => {
	if (!req.authed) {
		sendStatus(401, "error.forbidden");
		return;
	}

	try {
		await dbQuery("DELETE FROM users WHERE uid = ?", [req.profile.uid]);
	} catch (e) {
		console.log(e);
		sendStatus(req, res, 500, "error.delete_account");
		return;
	}

	fs.rm(path.join(__dirname, `${PFP_PATH}/${req.profile.image}`), e => { if (e) console.log(e)});
	fs.rm(path.join(__dirname, `${BG_PATH}/${req.profile.bkg}`), e => { if (e) console.log(e)});
	
	// after deleting the user, find stray tracks that are not longer used by any user, and delete it/them
	let strayTracks = await dbQuery("SELECT image FROM tracks WHERE id NOT IN (SELECT track_id AS id FROM user_tracks)");
	await dbQuery("DELETE FROM tracks WHERE id NOT IN (SELECT track_id AS id FROM user_tracks)");
	for (let i = 0; i < strayTracks.length; i++) {
		fs.rm(path.join(__dirname, `${ALBUM_PATH}/${strayTracks[i].image}`), e => { if (e) console.log(e)});
	}
	sendStatus(req, res, 200, "success.deletion_ok");
	return;
});


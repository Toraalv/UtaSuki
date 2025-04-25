"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;
const upload = require("../forms.js").upload;

const express = require("express");
const app = express();

module.exports = app.post('/', upload.none(), async (req, res) => {
	let parsedData = JSON.parse(req.body.data);
	let trackID = parsedData.id;
	let rawTrackDate = new Date(parsedData.date);
	let trackDate = `${rawTrackDate.getFullYear()}-${rawTrackDate.getMonth() + 1}-15`; // ####-##-15 feels wrong but is 100% acceptable

	let db_res = await dbQuery("DELETE FROM user_tracks WHERE track_id = ? AND uid = ? AND date = ?", [trackID, req.profile.uid, trackDate]); // stupid ass primary key with three columns
	// todo: remove from tracks too, and image, if there is no one else who uses that track
	console.log(db_res);

	sendStatus(req, res, 200, "success.status_ok");
});


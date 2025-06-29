"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get('/', async (req, res) => {
	const activities = await dbQuery("SELECT users.uid, username, users.image as pfp, tracks.image as cover, tracks.artist, action, date, title FROM activity JOIN user_tracks ON target = user_tracks.id JOIN tracks ON tracks.id = user_tracks.track_id JOIN users ON activity.uid = users.uid WHERE public IS TRUE");

	sendStatus(req, res, 200, "success.get_activities", activities);
});


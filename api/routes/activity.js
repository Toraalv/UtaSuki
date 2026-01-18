"use strict"

const sendStatus = require("../helpers.js").sendStatus;
const dbQuery = require("../db.js").dbQuery;

const express = require("express");
const app = express();

module.exports = app.get('/', async (req, res) => {
	const activities = await dbQuery("SELECT users.uid, username, users.image as pfp, tracks.image as cover, tracks.artist, action, date, title, public FROM activity JOIN user_tracks ON target = user_tracks.id JOIN tracks ON tracks.id = user_tracks.track_id JOIN users ON activity.uid = users.uid JOIN user_settings ON users.uid = user_settings.uid");

	if (!req.admin)
		for (let i = 0; i < activities.length; i++)
			if (!activities[i].public) {
				activities.splice(i, 1);
				i--;
			}

	sendStatus(req, res, 200, "success.get_activities", activities);
});


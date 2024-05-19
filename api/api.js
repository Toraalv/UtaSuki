"use strict"

const express = require("express");
const app = express();
const http = require("http");
// konstanter
const APP_ENV = process.env.APP_ENV;
const VERSION = process.env.npm_package_version;
const PORT = APP_ENV == "dev" ? 5900 : 8800; // ぱちぱち　ごく

// db anslutning
const mariadb = require("mariadb");
const pool = mariadb.createPool({
	socketPath: "/run/mysqld/mysqld.sock",
	user: process.env.UTASUKI_DB_USER,
	password: process.env.UTASUKI_DB_PASS,
	database: process.env.UTASUKI_DB_DATABASE,
	connectionLimit: 5
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/status", (res) => res.status(200).json({ status: "OK", version: VERSION }));

app.get("/years", async (req, res) => {
	let username = "";
	try {
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.user_not_specified"
			}
		});
		return;
	}
	
	let userExist = await dbQuery(`SELECT 1 FROM users WHERE username = ?`, [username]);
	if (!userExist.length) { // strävan efter så korta if-satser som möjligt är konstant
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.user_not_exist"
			}
		});
		return;
	}

	let data = await dbQuery(`SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE username = ?`, [username]);

	// om användaren inte har några låtar
	if (data.length == 0) {
		res.status(200).json({
			status: "SEMI-OK",
			version: VERSION,
			years: []
		});
		return;
	}

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // tar ut unika år, 凄い

	res.status(200).json({
		status: "OK",
		version: VERSION,
		years: years
	});
});

app.get("/tracks", async (req, res) => {
	let year = "";
	let username = "";
	try {
		year = JSON.parse(req.query.data).year;
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.year_user_not_specified"
			}
		});
		return;
	}
	let userExist = await dbQuery(`SELECT 1	FROM users WHERE username = ?`, [username]);
	if (!userExist.length) { // strävan efter så korta if-satser som möjligt är konstant
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.user_not_exist"
			}
		});
		return;
	}
	
	let data = await dbQuery(`
							SELECT
								date,
								artist,
								album,
								title,
								released,
								image,
								description,
								last_edit
							FROM
								user_tracks
							JOIN
								tracks
							ON
								tracks.id = track_id
							JOIN
								users
							ON
								users.uid = user_tracks.uid
							WHERE username = ?
								AND date >= ?
									AND date < ?;`,
		[
			username,
			`${year}-01-01`,
			`${Number(year) + 1}-01-01`,
		]);

	if (data.length == 0) {
		res.status(404).json({
			status: "SEMI-OK",
			version: VERSION,
			message: {
				severity: "warning",
				code: "warning.no_tracks_year"
			}
		});
		return;
	}

	let monthTracks = [[], [], [], [], [], [], [], [], [], [], [], []]; // det här är ju typ ganska fult

	for (let i = 0; i < data.length; i++) {
		monthTracks[data[i].date.getMonth()].push({
			artist: data[i].artist,
			album: data[i].album,
			title: data[i].title,
			released: data[i].released,
			image: data[i].image,
			description: data[i].description,
			last_edit: data[i].last_edit,
		});
	}

	res.status(200).json({
		status: "OK",
		version: VERSION,
		tracks: monthTracks
	});
});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => { console.log("Running on port " + PORT); });

async function dbQuery(query, params) {
	return new Promise(function(resolve, reject) {
		try {
			pool.getConnection().then(conn => {
				conn.query(query, params).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) { console.log(e); }
	});
}


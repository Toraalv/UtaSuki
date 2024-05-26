"use strict"

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
// konstanter
const APP_ENV = process.env.APP_ENV;
const VERSION = process.env.npm_package_version;
const PORT = APP_ENV == "dev" ? 5900 : 8800; // ぱちぱち　ごく
const HTTPS_PORT = 8802;
let privateKey, certificate, ca;
if (APP_ENV != "dev") {
	privateKey = fs.readFileSync("/etc/letsencrypt/live/utasuki.toralv.dev/privkey.pem", "utf8");
	certificate = fs.readFileSync("/etc/letsencrypt/live/utasuki.toralv.dev/cert.pem", "utf8");
	ca = fs.readFileSync("/etc/letsencrypt/live/utasuki.toralv.dev/chain.pem", "utf8");
}
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

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
app.use("/static", express.static(path.join(__dirname, "public")));

// formulär filhantering
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const handleError = (err, res) => {
	res.status(500).json({
		status: "NOT OK",
		version: VERSION,
		message: {
			severity: "error",
			code: "error.file_upload"
		}
	});
};

const upload = multer({
	dest: "./.temp/"
});


app.get("/status", (res) => res.status(200).json({ status: "OK", version: VERSION }));

app.get("/users", async (req, res) => {
	let users = await dbQuery(`SELECT username, created, image FROM users WHERE public IS TRUE;`);

	if (users.length == 0) {
		res.status(200).json({
			status: "SEMI-OK",
			version: VERSION,
			data: []
		});
		return;
	}

	res.status(200).json({
		status: "OK",
		version: VERSION,
		data: users
	});
});

app.get("/years", async (req, res) => {
	let username = "";
	try {
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		res.status(400).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.user_not_specified"
			}
		});
		return;
	}
	
	// kolla så att användaren existerar -- OBS, uid är primärnyckel, men jag kollar username. detta är absolut ett problem
	let userExist = await dbQuery(`SELECT 1 FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
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
		res.status(404).json({
			status: "SEMI-OK",
			version: VERSION,
			message: {
				severity: "info",
				code: "info.user_no_tracks"
			}
		});
		return;
	}

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // tar ut unika år, 凄い

	res.status(200).json({
		status: "OK",
		version: VERSION,
		data: years
	});
});

app.get("/tracks", async (req, res) => {
	let year = "";
	let username = "";
	try {
		year = JSON.parse(req.query.data).year;
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		res.status(400).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.year_user_not_specified"
			}
		});
		return;
	}

	// kolla så att användaren existerar -- OBS, uid är primärnyckel, men jag kollar username. detta är absolut ett problem
	let userExist = await dbQuery(`SELECT 1	FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
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
								tracks.image,
								description,
								last_edit,
								track_desc_public
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
			description: data[i].track_desc_public && data[i].description,
			last_edit: data[i].track_desc_public && data[i].last_edit,
		});
	}

	res.status(200).json({
		status: "OK",
		version: VERSION,
		data: monthTracks
	});
});

app.post("/addTrack", upload.single("file"), async (req, res) => {
	console.log(req.path);

	let username = req.body.username;
	let artist = req.body.artist;
	let album = req.body.album;
	let title = req.body.title;
	let date = req.body.date;
	let released = req.body.released;
	let description = req.body.description;

	// se till att alla fält är ifyllda
	if ([username, artist, album, title, date, released, description].includes(undefined)) {
		res.status(400).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				severity: "error",
				code: "error.addtrack_fields_not_specified"
			}
		});
		return;
	}
	
	// kolla så att användaren existerar -- OBS, uid är primärnyckel, men jag kollar username. detta är absolut ett problem
	let userExist = await dbQuery(`SELECT uid FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
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

	let trackExist = await dbQuery(`SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?`, [artist, album, title]);
	
	// om låt existerar, lägg bara till i user_tracks, annars skapas den och läggs till i tracks
	if (trackExist.length) { // bör aldrig vara större än 1
		try {
			let userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, description) VALUES(?, ?, ?, ?)`, [userExist[0].uid, trackExist[0].id, date, description]);
			console.log(userTrackInsert);
		} catch (e) {
			console.log(e.code);
			res.status(404).json({
				status: "NOT OK",
				version: VERSION,
				message: {
					severity: "error",
					code: "error.track_already_added"
				}
			});
			return;
		}
	}
	else {
		try {
			let trackInsert = await dbQuery(`
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
					`https://utasuki.toralv.dev:8802/static/images/album_covers/${album}.FILFORMAT`
				]
			);
			let userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, description) VALUES(?, ?, ?, ?)`, [userExist[0].uid, trackInsert.insertId, date, description]);
		} catch (e) {
			res.status(404).json({
				status: "NOT OK",
				version: VERSION,
				message: {
					severity: "error",
					code: "error.undefined"
				}
			});
			return;
		}
	}

	res.status(200).json({
		status: "OK",
		version: VERSION
	});
});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => { console.log("Running on port " + PORT); });

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, () => { console.log("Running on port " + HTTPS_PORT); });

async function dbQuery(query, params) {
	return new Promise(function(resolve, reject) {
		try {
			pool.getConnection().then(conn => {
				conn.query(query, params).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) { console.log(e); }
	});
}


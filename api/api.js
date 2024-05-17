"use strict"

// paket, typ
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
	socketPath: "/run/mysqld/mysqld.sock", // すげぇ、効率的だわ
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
				en: "User not specified."
			}
		});
		return;
	}

	let userExist = await dbQuery(`SELECT 1 FROM users WHERE username = "${username}"`); // osaniterad data
	if (!userExist.length) { // strävan efter så korta if-satser som möjligt är konstant
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				en: "User doesn't exist."
			}
		});
		return;
	}

	let data = await dbQuery(`SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE username = "${username}"`); // osaniterad data

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
				en: "No tracks for specified year or user."
			}
		});
		return;
	}
	let userExist = await dbQuery(`SELECT 1 FROM users WHERE username = "${username}"`); // osaniterad data
	if (!userExist.length) { // strävan efter så korta if-satser som möjligt är konstant
		res.status(404).json({
			status: "NOT OK",
			version: VERSION,
			message: {
				en: "User doesn't exist."
			}
		});
		return;
	}
	
	let data = await dbQuery(`SELECT date, artist, album, title, released, image, description, last_edit FROM user_tracks JOIN tracks ON tracks.id = track_id JOIN users ON users.uid = user_tracks.uid WHERE username = "${username}" AND date >= '${year}-01-01' AND date < '${parseInt(year) + 1}-01-01';`); // osaniterad data

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
	// TODO, om inga låtar finns, skicka felmeddelande och visa det för användaren
	console.log("pang pang");
	res.status(200).json({
		status: "OK",
		version: VERSION,
		tracks: monthTracks
	});
});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => { console.log("Running on port " + PORT); });

async function dbQuery(query) {
	return new Promise(function(resolve, reject) {
		try {
			pool.getConnection().then(conn => {
				conn.query(query).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) { console.log(e); }
	});
}


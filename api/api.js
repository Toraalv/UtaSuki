"use strict"

const helper = require("./helper.js");

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const jwt = require("jsonwebtoken");

const APP_ENV = process.env.APP_ENV;
const VERSION = process.env.npm_package_version;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const PORT = APP_ENV == "dev" ? 5900 : 8800; // ごく　ぱちぱち
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

// db connection
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

// form file management
const multer = require("multer");
const upload = multer({
	dest: "./.temp/"
});
const { body, validationResult } = require("express-validator");

const sendStatus = (res, status, severity, code, data) => {
	res.status(status).json({
		version: VERSION,
		message: {
			severity: severity,
			code: code
		},
		data: data
	});
};

app.get("/status", (req, res) => {
	sendStatus(res, 200, "success", "info.status_ok");
});

app.get("/users", async (req, res) => {
	let users = await dbQuery(`SELECT username, created, image, last_activity FROM users WHERE public IS TRUE;`);

	if (users.length == 0) {
		sendStatus(res, 404, "info", "info.no_users", []);
		return;
	}

	sendStatus(res, 200, "success", "info.users_found", users);
});

app.get("/years", async (req, res) => {
	let username = "";
	try {
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		sendStatus(res, 400, "error", "error.user_not_specified");
		return;
	}
	
	let userExist = await dbQuery(`SELECT 1 FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
		sendStatus(res, 404, "error", "error.user_not_exist")
		return;
	}

	let data = await dbQuery(`SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE username = ? ORDER BY date`, [username]);

	// if user has any tracks
	if (data.length == 0) {
		sendStatus(res, 404, "info", "info.user_no_tracks");
		return;
	}

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // extracts unique years, 凄い

	sendStatus(res, 200, "success", undefined, years);
});

app.get("/tracks", async (req, res) => {
	let year = "";
	let username = "";
	try {
		year = JSON.parse(req.query.data).year;
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		sendStatus(res, 400, "error", "error.year_user_not_specified");
		return;
	}

	let userExist = await dbQuery(`SELECT 1	FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
		sendStatus(res, 404, "error", "error.user_not_exist");
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
								notes,
								last_edit,
								track_notes_public
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
		sendStatus(res, 404, "warning", "warning.no_tracks_year");
		return;
	}

	let monthTracks = [[], [], [], [], [], [], [], [], [], [], [], []];

	for (let i = 0; i < data.length; i++) {
		monthTracks[data[i].date.getMonth()].push({
			artist: data[i].artist,
			album: data[i].album,
			title: data[i].title,
			released: data[i].released,
			image: data[i].image,
			notes: data[i].track_notes_public && data[i].notes,
			last_edit: data[i].track_notes_public && data[i].last_edit,
		});
	}

	sendStatus(res, 200, "success", undefined, monthTracks);
});

app.get("/verifyAuthToken", async (req, res) => {
	let token = helper.getCookie("auth_token", req.headers.cookie);

	jwt.verify(token, TOKEN_SECRET, (err, data) => {
		console.log(err);
		console.log(data);
	});

	res.status(200).json({
		status: "OK",
		version: VERSION
	});
});

// something something multer, bodyparse and content-type, どうしおかな〜〜
app.post("/login", upload.single("file"), async (req, res) => {
	const Token = (uid, username) => { return jwt.sign({ uid, username }, TOKEN_SECRET, { expiresIn: '300s' }); }

	let username = req.body.username;
	let password = req.body.password;

	// makes sure that every field is filled
	if ([username, password].includes(undefined)) {
		sendStatus(res, 400, "error", "error.login_fields_not_specified");
		return;
	}

	let userInfo = await dbQuery(`SELECT uid, password FROM users WHERE username = ?`, [username]);
	if (!userInfo.length) {
		sendStatus(res, 418, "error", "error.login_general");
		return;
	}

	let checkAttempts = await dbQuery(`SELECT ip FROM logins WHERE ip = ?`, [req.ip]);
	if (checkAttempts.length > 4) {
		sendStatus(res, 429, "warning", "warning_too_many_login_attempts");
		return;
	}

	if (userInfo[0].password == password) { // ( ^)o(^ )b
		let userToken = Token(userInfo[0].uid, username);
		let setUserTokenRes = await dbQuery(`UPDATE users SET auth_token = ? WHERE uid = ?`, [userToken, userInfo[0].uid]);
		sendStatus(res, 200, "success", "info.login_success", { token: userToken });
		return;
	} else {
		let setLoginAttempt = await dbQuery(`INSERT INTO logins (ip) VALUES (?)`, [req.ip]);
		sendStatus(res, 418, "error", "error.login_general");
		return;
	}
});

app.post("/addTrack", upload.single("file"), async (req, res) => {
	console.log(req.ip);

	const tempPath = req.file.path;
	const handleError = (status, code, trackInsert) => {
		// removes the track if something failed
		if (trackInsert)
			dbQuery(`DELETE FROM tracks WHERE id = ?;`, [trackInsert.insertId]);

		fs.rm(tempPath, e => { if (e) return sendStatus(res, 500, "error", "error.file_upload") });
		sendStatus(res, status, "error", code);
	}

	if (req.ip != "::ffff:127.0.0.1" && req.ip != "::ffff:192.168.50.1" && req.ip != "::1") { // 何故この１？何故なの？勘弁してくれ〜〜
		handleError(401, "error.forbidden");
		return;
	}

	//let username = req.body.username;
	let username = "Toralv";
	let artist = req.body.artist;
	let album = req.body.album;
	let title = req.body.title;
	let date = `${req.body.year}-${req.body.month}`;
	//let released = req.body.released;
	let released = "0000-00-00";
	let notes = req.body.notes;

	// makes sure that every field is filled
	if ([username, artist, album, title, date].includes(undefined)) {
		handleError(400, "error.add_track_fields_not_specified");
		return;
	}

	date = `${date}-15`; // cannot not add "-15" before undefined check (because then it would never be undefined)

	// the image
	const imageExt = path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, `./public/images/album_covers/${album}${imageExt}`);
	
	let userExist = await dbQuery(`SELECT uid FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
		handleError(404, "error.user_not_exist");
		return;
	}

	let trackExist = await dbQuery(`SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?`, [artist, album, title]);
	
	let userTrackInsert, trackInsert;
	if (trackExist.length) { // if track already exists, only add to user_tracks, otherwise both tracks and user_tracks
		try {
			userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)`, [userExist[0].uid, trackExist[0].id, date, notes]);
		} catch (e) {
			handleError(418, "error.track_already_added");
			return;
		}
	}
	else {
		try {
			trackInsert = await dbQuery(`
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
					`/static/images/album_covers/${album}${imageExt}`
				]
			);
			userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)`, [userExist[0].uid, trackInsert.insertId, date, notes]);
		} catch (e) {
			handleError(500, "error.add_track", trackInsert, userTrackInsert);
			return;
		}
	}

	// update last_activity
	try {
		let userUpdateActivity = await dbQuery(`UPDATE users SET last_activity = current_timestamp() WHERE uid = ?`, [userExist[0].uid]);
	} catch (e) {
		handleError(500, "error.user_activity", trackInsert, userTrackInsert);
		return;
	}

	fs.rm(tempPath, e => { if (e) return sendStatus(res, 500, "error", "error.file_upload") });

	sendStatus(res, 200, "success", "info.add_track_success");
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


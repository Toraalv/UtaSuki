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
let privateKey, certificate;
if (APP_ENV != "dev") {
	privateKey = fs.readFileSync("/etc/letsencrypt/live/cdn.utasuki.toralv.dev/privkey.pem", "utf8");
	certificate = fs.readFileSync("/etc/letsencrypt/live/cdn.utasuki.toralv.dev/cert.pem", "utf8");
} else {
	privateKey = fs.readFileSync("cert/localhost-key.pem", "utf8");
	certificate = fs.readFileSync("cert/localhost.pem", "utf8");
}
const credentials = {
	key: privateKey,
	cert: certificate,
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

const sendStatus = (req, res, status, severity, code, data) => {
	res.status(status).json({
		version: VERSION,
		message: {
			severity: severity,
			code: code
		},
		data: data,
		auth_info: {
			authed: req.authed,
			profile: req.profile
		}
	});
};

app.use((req, res, next) => {
	let token = helper.getCookie("auth_token", req.headers.cookie);

	jwt.verify(token, TOKEN_SECRET, async (e, data) => {
		if (e) req.authed = false;
		else {
			// check if token matches the stored token
			if ((await dbQuery(`SELECT 1 FROM users WHERE uid = ? AND auth_token = ?`, [data.uid, token])).length) {
				req.authed = true;
				// chuck the whole profile with auth_info, why not
				let user = await dbQuery(`SELECT uid, username, created, image, last_activity, public FROM users WHERE auth_token = ?;`, [token]);
				req.profile = user[0];
			}
		}
		next();
	});
});

app.get("/status", (req, res) => {
	sendStatus(req, res, 200, "success", "info.status_ok");
});

app.get("/users", async (req, res) => {
	let users = await dbQuery(`SELECT uid, username, created, image, last_activity FROM users WHERE public IS TRUE;`);

	if (users.length == 0) {
		sendStatus(req, res, 200, "info", "info.no_users", []);
		return;
	}

	sendStatus(req, res, 200, "success", "info.users_found", users);
});

app.get("/years", async (req, res) => {
	let username = "";
	try {
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		sendStatus(req, res, 400, "error", "error.user_not_specified");
		return;
	}
	
	let profile = await dbQuery(`SELECT uid, username, created, image, last_activity FROM users WHERE username = ?`, [username]);
	if (!profile.length) {
		sendStatus(req, res, 404, "error", "error.user_not_exist")
		return;
	}

	let data = await dbQuery(`SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE username = ? ORDER BY date`, [username]);

	// if user has any tracks
	if (data.length == 0) {
		sendStatus(req, res, 200, "info", "info.user_no_tracks", {profile: profile[0], undefined, totalTracks: 0});
		return;
	}

	let totalTracks = data.length;

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // extracts unique years, 凄い

	sendStatus(req, res, 200, "success", undefined, {profile: profile[0], years: years, totalTracks: totalTracks});
});

app.get("/tracks", async (req, res) => {
	let year = "";
	let username = "";
	try {
		year = JSON.parse(req.query.data).year;
		username = JSON.parse(req.query.data).username;
	} catch (e) {
		sendStatus(req, res, 400, "error", "error.year_user_not_specified");
		return;
	}

	let userExist = await dbQuery(`SELECT 1	FROM users WHERE username = ?`, [username]);
	if (!userExist.length) {
		sendStatus(req, res, 404, "error", "error.user_not_exist");
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
		sendStatus(req, res, 404, "warning", "warning.no_tracks_year");
		return;
	}

	// I'll leave this here for memories sake
	//let monthTracks = [[], [], [], [], [], [], [], [], [], [], [], []];
	//let monthTracks = new Array(12).fill([]);
	let monthTracks = new Array(12).fill(null).map(() => []);

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

	sendStatus(req, res, 200, "success", undefined, monthTracks);
});

app.post("/login", upload.single("file"), async (req, res) => {
	const Token = (uid, username) => { return jwt.sign({ uid, username }, TOKEN_SECRET, { expiresIn: '1h' }); }

	let username = req.body.username;
	let password = req.body.password;

	// makes sure that every field is filled
	if ([username, password].includes(undefined)) {
		sendStatus(req, res, 400, "error", "error.login_fields_not_specified");
		return;
	}

	// check login attempts
	let checkAttempts = await dbQuery(`SELECT ip FROM logins WHERE ip = ?`, [req.ip]);
	if (checkAttempts.length > 4) {
		sendStatus(req, res, 429, "warning", "warning.too_many_login_attempts");
		return;
	}

	// does the user exist?
	let userInfo = await dbQuery(`SELECT uid, password FROM users WHERE username = ?`, [username]);
	if (!userInfo.length) {
		let setLoginAttempt = await dbQuery(`INSERT INTO logins (ip) VALUES (?)`, [req.ip]);
		sendStatus(req, res, 418, "error", "error.login_general");
		return;
	}

	// is the password correct?
	if (userInfo[0].password == password) { // ( ^)o(^ )b
		let userToken = Token(userInfo[0].uid, username);
		let setUserTokenRes = await dbQuery(`UPDATE users SET auth_token = ? WHERE uid = ?`, [userToken, userInfo[0].uid]);
		sendStatus(req, res, 200, "success", "info.login_success", { token: userToken });
		return;
	} else {
		let setLoginAttempt = await dbQuery(`INSERT INTO logins (ip) VALUES (?)`, [req.ip]);
		sendStatus(req, res, 418, "error", "error.login_general");
		return;
	}
});

app.post("/logout", upload.single("file"), (req, res) => {
	if (!req.authed) {
		sendStatus(req, res, 404, "error", "error.not_logged_in");
		return;
	}

	dbQuery(`UPDATE users SET auth_token = NULL WHERE uid = ?`, [req.uid]);

	sendStatus(req, res, 200, "success", "info.logout_success");
});

app.post("/addTrack", upload.single("file"), async (req, res) => {
	let tempPath;
	if (req.file != undefined)
		tempPath = req.file.path;
	else {
		sendStatus(req, res, 400, "error", "error.no_image");
		return
	}

	const handleError = (status, code, trackInsert) => {
		// removes the track if something failed
		if (trackInsert)
			dbQuery(`DELETE FROM tracks WHERE id = ?;`, [trackInsert.insertId]);

		fs.rm(tempPath, e => { if (e) return sendStatus(req, res, 500, "error", "error.file_upload") });
		sendStatus(req, res, status, "error", code);
	}

	if (!req.authed) {
		handleError(401, "error.forbidden");
		return;
	}

	//let username = req.body.username;
	let uid = req.profile.uid;
	let artist = req.body.artist;
	let album = req.body.album;
	let title = req.body.title;
	let date = `${req.body.year}-${req.body.month}-15`;
	//let released = req.body.released;
	let released = "0000-00-00";
	let notes = req.body.notes;

	// makes sure that every field is filled
	if ([uid, artist, album, title, req.body.year, req.body.month].includes(undefined))
		if (typeof(req.body.year) == "number" && req.body.month > 0 && req.body.month < 13) {
			handleError(400, "error.add_track_fields_not_specified");
			return;
		}

	// the image
	const imageExt = path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, `./public/images/album_covers/${album}${imageExt}`);
	
	let trackExist = await dbQuery(`SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?`, [artist, album, title]);
	
	let userTrackInsert, trackInsert;
	if (trackExist.length) { // if track already exists, only add to user_tracks, otherwise both tracks and user_tracks
		try {
			userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)`, [uid, trackExist[0].id, date, notes]);
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
			userTrackInsert = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)`, [uid, trackInsert.insertId, date, notes]);
		} catch (e) {
			handleError(500, "error.add_track", trackInsert, userTrackInsert);
			return;
		}
	}

	// update last_activity
	try {
		let userUpdateActivity = await dbQuery(`UPDATE users SET last_activity = current_timestamp() WHERE uid = ?`, [uid]);
	} catch (e) {
		handleError(500, "error.user_activity", trackInsert, userTrackInsert);
		return;
	}

	fs.rename(tempPath, targetPath, e => { if (e) return sendStatus(req, res, 500, "error", "error.file_upload") });

	sendStatus(req, res, 200, "success", "info.add_track_success");
});


const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => { console.log("Running on port " + PORT); });

async function dbQuery(query, params) {
	return new Promise(function(resolve, reject) {
		try {
			pool.getConnection().then(conn => {
				conn.query(query, params).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) { console.log(e); }
	});
}


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

const sendStatus = (req, res, status, code, data) => {
	res.status(status).json({
		version: VERSION,
		code: code,
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
			if ((await dbQuery("SELECT 1 FROM users WHERE uid = ? AND auth_token = ?", [data.uid, token])).length) {
				req.authed = true;
				// chuck the whole profile with auth_info, why not
				let user = await dbQuery("SELECT uid, username, created, image, image_ver, last_activity, public, track_notes_public, language FROM users WHERE auth_token = ?;", [token]);
				req.profile = user[0];
			}
		}
		next();
	});
});

app.get("/status", (req, res) => {
	sendStatus(req, res, 200, "success.status_ok");
});

app.get("/users", async (req, res) => {
	let users = await dbQuery("SELECT uid, username, created, image, image_ver, last_activity FROM users WHERE public IS TRUE;");

	if (users.length == 0) {
		sendStatus(req, res, 200, "info.no_users", []);
		return;
	}

	sendStatus(req, res, 200, "success.users_found", users);
});

app.get("/years", async (req, res) => {
	let uid = 0;
	try {
		uid = JSON.parse(req.query.data).uid;
	} catch (e) {
		sendStatus(req, res, 400, "error.user_not_specified");
		return;
	}
	
	let profile = await dbQuery("SELECT uid, username, created, image, image_ver, last_activity, public FROM users WHERE uid = ?", [uid]);
	if (!profile.length) {
		sendStatus(req, res, 404, "error.user_not_exist")
		return;
	}

	if (!profile[0].public && uid != req.profile?.uid) {
		sendStatus(req, res, 403, "error.user_private");
		return;
	}

	let data = await dbQuery("SELECT date FROM user_tracks JOIN users ON users.uid = user_tracks.uid WHERE users.uid = ? ORDER BY date", [uid]);

	// if user has any tracks
	if (data.length == 0) {
		sendStatus(req, res, 200, "info.user_no_tracks", {profile: profile[0], undefined, totalTracks: 0});
		return;
	}

	let totalTracks = data.length;

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // extracts unique years, 凄い

	sendStatus(req, res, 200, "success.years_found", {profile: profile[0], years: years, totalTracks: totalTracks});
});

app.get("/tracks", async (req, res) => {
	let year = "";
	let uid = 0;
	try {
		year = JSON.parse(req.query.data).year;
		uid = JSON.parse(req.query.data).uid;
	} catch (e) {
		sendStatus(req, res, 400, "error.year_user_not_specified");
		return;
	}

	let userExist = await dbQuery("SELECT public FROM users WHERE uid = ?", [uid]);
	if (!userExist.length) {
		sendStatus(req, res, 404, "error.user_not_exist");
		return;
	}

	if (!userExist[0].public && uid != req.profile?.uid) {
		sendStatus(req, res, 403, "error.user_private");
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
			artist: data[i].artist,
			album: data[i].album,
			title: data[i].title,
			released: data[i].released,
			image: data[i].image,
			notes: uid == req.profile?.uid ? data[i].notes : data[i].track_notes_public && data[i].notes,
			last_edit: data[i].track_notes_public && data[i].last_edit,
		});
	}

	sendStatus(req, res, 200, "success.tracks_found", monthTracks);
});

app.post("/login", upload.none(), async (req, res) => {
	const Token = (uid, email) => { return jwt.sign({ uid, email }, TOKEN_SECRET, { expiresIn: '1h' }); }

	let email = req.body.email;
	let password = req.body.password;

	// makes sure that every field is filled
	if ([email, password].includes(undefined)) {
		sendStatus(req, res, 400, "error.fields_not_specified");
		return;
	}

	// check login attempts
	let checkAttempts = await dbQuery("SELECT ip FROM logins WHERE ip = ?", [req.ip]);
	if (checkAttempts.length > 4) {
		sendStatus(req, res, 429, "warning.too_many_login_attempts");
		return;
	}

	// does the user exist?
	let userInfo = await dbQuery("SELECT uid, password FROM users WHERE email = ?", [email]);
	if (!userInfo.length) {
		let setLoginAttempt = await dbQuery("INSERT INTO logins (ip) VALUES (?)", [req.ip]);
		sendStatus(req, res, 418, "error.login_general");
		return;
	}

	// is the password correct?
	if (userInfo[0].password == password) {
		let userToken = Token(userInfo[0].uid, email);
		let setUserTokenRes = await dbQuery("UPDATE users SET auth_token = ? WHERE uid = ?", [userToken, userInfo[0].uid]);
		sendStatus(req, res, 200, "success.login_success", { token: userToken });
		return;
	} else {
		let setLoginAttempt = await dbQuery("INSERT INTO logins (ip) VALUES (?)", [req.ip]);
		sendStatus(req, res, 418, "error.login_general");
		return;
	}
});

app.post("/register", upload.single("file"), async (req, res) => {
	if (req.file == undefined) {
		sendStatus(req, res, 400, "error.no_image");
		return
	}

	let email = req.body.email;
	let username = req.body.username;
	let password = req.body.password;

	if ([email, username, password].includes(undefined)) {
		sendStatus(req, res, 400, "error.fields_not_specified");
		return;
	}

	let userExist = await dbQuery("SELECT 1 FROM users WHERE email = ?", [email]);
	if (userExist.length) {
		fs.rm(req.file.path, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });
		sendStatus(req, res, 418, "error.user_email_exists");
		return;
	}

	let createUser;
	try  {
		createUser = await dbQuery("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [email, username, password]);
	} catch (e) {
		fs.rm(req.file.path, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });
		sendStatus(req, res, 500, "error.create_user");
		return;
	}

	// add image after user creation so we can link uid instead
	const filename = createUser.insertId + path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, "./public/images/profile_pictures/" + filename);
	fs.rename(req.file.path, targetPath, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });

	let userPicture = await dbQuery("UPDATE users SET image = ? WHERE uid = ?", ["/static/images/profile_pictures/" + filename, createUser.insertId]);

	sendStatus(req, res, 200, "success.user_created");
});

app.post("/updateSettings", upload.single("profile_picture"), async (req, res) => {
	// this error will never be shown to the user since /settings redirects unauthed users to /
	// only time this happens is when an user's cookie expires, as they try to change their settings
	if (!req.authed) {
		sendStatus(req, res, 401, "error.forbidden");
		return;
	}

	let change = false;
	// update name
	let username = req.body.userhandle;
	if ((username != undefined || username != '') && username != req.profile.username) {
		try {
			await dbQuery("UPDATE users SET username = ? WHERE uid = ?", [username, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_username");
			return;
		}
	}

	// update profile picture
	if (req.file != undefined) {
		try {
			const filename = req.profile.uid + path.extname(req.file.originalname).toLowerCase();
			const targetPath = path.join(__dirname, "./public/images/profile_pictures/" + filename);
			fs.rename(req.file.path, targetPath, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });

			await dbQuery("UPDATE users SET image = ?, image_ver = ? WHERE uid = ?", ["/static/images/profile_pictures/" + filename, req.profile.image_ver + 1, req.profile.uid]);
			change = true;
		} catch (e) {
			fs.rm(req.file.path, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });
			sendStatus(req, res, 500, "error.update_profile_picture");
			return;
		}
	}

	// update public setting
	let isPublic = req.body.public == "on" ? 1 : 0;
	if (isPublic != req.profile.public) {
		try {
			await dbQuery("UPDATE users SET public = ? WHERE uid = ?", [isPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}
	// update track notes public setting
	let isTrackNotesPublic = req.body.track_notes_public == "on" ? 1 : 0;
	if (isTrackNotesPublic != req.profile.track_notes_public) {
		try {
			await dbQuery("UPDATE users SET track_notes_public = ? WHERE uid = ?", [isTrackNotesPublic, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_public");
			return;
		}
	}

	// language
	if (req.body.language && req.body.language != req.profile.language) {
		try {
			await dbQuery("UPDATE users SET language = ? WHERE uid = ?", [req.body.language, req.profile.uid]);
			change = true;
		} catch (e) {
			sendStatus(req, res, 500, "error.update_lang");
			return;
		}
	}

	if (change)
		sendStatus(req, res, 200, "success.updated_settings");
	else
		sendStatus(req, res, 200, "info.no_change");
});

app.post("/logout", upload.none(), (req, res) => {
	if (!req.authed) {
		sendStatus(req, res, 404, "error.not_logged_in");
		return;
	}

	dbQuery("UPDATE users SET auth_token = NULL WHERE uid = ?", [req.uid]);

	sendStatus(req, res, 200, "success.logout");
});

app.post("/addTrack", upload.single("file"), async (req, res) => {
	if (req.file == undefined) {
		sendStatus(req, res, 400, "error.no_image");
		return
	}

	const handleError = (status, code, trackInsert) => {
		// removes the track if something failed
		if (trackInsert)
			dbQuery("DELETE FROM tracks WHERE id = ?;", [trackInsert.insertId]);

		fs.rm(req.file.path, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });
		sendStatus(req, res, status, code);
	}

	if (!req.authed) {
		handleError(401, "error.forbidden");
		return;
	}

	let uid = req.profile.uid;
	let artist = req.body.artist;
	let album = req.body.album;
	let title = req.body.title;
	let date = `${req.body.year}-${req.body.month}-15`;
	//let released = req.body.released;
	let released = "0000-00-00";
	let notes = req.body.notes;

	// makes sure that every field is filled and correct
	if ([uid, artist, album, title, req.body.year, req.body.month].map((obj) => obj == undefined || obj == '').includes(true)) {
		handleError(400, "error.add_track_fields_not_specified");
		return;
	}
	if (typeof(req.body.year) == "number" && req.body.month > 0 && req.body.month < 13) {
		handleError(400, "error.add_track_fields_not_specified");
		return;
	}
	if ([artist, encodeURIComponent(album) + ".jpeg", title].map((obj) => obj.length > 255).includes(true) || notes.length > 1024) {
		handleError(400, "error.field_too_long");
		return;
	}

	const filename = encodeURIComponent(album) + path.extname(req.file.originalname).toLowerCase();
	const targetPath = path.join(__dirname, "./public/images/album_covers/" + filename);
	
	let trackExist = await dbQuery("SELECT id FROM tracks WHERE artist = ? AND album = ? AND title = ?", [artist, album, title]);
	
	let userTrackInsert, trackInsert;
	if (trackExist.length) { // if track already exists, only add to user_tracks, otherwise both tracks and user_tracks
		try {
			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackExist[0].id, date, notes]);
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
					filename
				]
			);
			userTrackInsert = await dbQuery("INSERT INTO user_tracks (uid, track_id, date, notes) VALUES(?, ?, ?, ?)", [uid, trackInsert.insertId, date, notes]);
		} catch (e) {
			console.log(e);
			handleError(500, "error.add_track", trackInsert, userTrackInsert);
			return;
		}
	}

	// update last_activity
	try {
		let userUpdateActivity = await dbQuery("UPDATE users SET last_activity = current_timestamp() WHERE uid = ?", [uid]);
	} catch (e) {
		handleError(500, "error.user_activity", trackInsert, userTrackInsert);
		return;
	}

	fs.rename(req.file.path, targetPath, e => { if (e) return sendStatus(req, res, 500, "error.file_upload") });

	sendStatus(req, res, 200, "success.add_track");
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


"use strict"

// own modules
const helpers = require("./helpers.js");
const getCookie = helpers.getCookie;
const dbQuery = require("./db.js").dbQuery;

// others modules
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const IS_DEV = process.env.APP_ENV == "dev" ? true : false;
const PORT = IS_DEV ? process.env.DEV_PORT : process.env.PROD_PORT;

const credentials = {
	key: fs.readFileSync(IS_DEV ? process.env.DEV_PRIVATE_KEY : process.env.PROD_PRIVATE_KEY, "utf8"),
	cert: fs.readFileSync(IS_DEV ? process.env.DEV_CERTIFICATE : process.env.PROD_CERTIFICATE, "utf8"),
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
	let token = getCookie("auth_token", req.headers.cookie);

	jwt.verify(token, TOKEN_SECRET, async (e, data) => {
		if (e) req.authed = false;
		else {
			// check if token matches the stored token
			if ((await dbQuery("SELECT 1 FROM users WHERE uid = ? AND auth_token = ?", [data.uid, token])).length) {
				req.authed = true;
				let user = await dbQuery("SELECT users.uid, username, created, image, image_ver, last_activity, public, notes_public, language, border_radius, body_margin, accent, accent_text, animations, bkg, bkg_ver, opacity, blur FROM users NATURAL JOIN user_settings WHERE auth_token = ?;", [token]);
				req.profile = user[0];
			}
		}
		next();
	});
});

// endpoints
const status = require("./routes/status.js");
const users = require("./routes/users.js");
const years = require("./routes/years.js");
const tracks = require("./routes/tracks.js");
const login = require("./routes/login.js");
const register = require("./routes/register.js");
const updateSettings = require("./routes/updateSettings.js");
const deleteAccount = require("./routes/deleteAccount.js");
const logout = require("./routes/logout.js");
const addTrack = require("./routes/addTrack.js");
const updateTrack = require("./routes/updateTrack.js");
const deleteTrack = require("./routes/deleteTrack.js");
const activity = require("./routes/activity.js");

app.use("/status", status);
app.use("/users", users);
app.use("/years", years);
app.use("/tracks", tracks);
app.use("/login", login);
app.use("/register", register);
app.use("/updateSettings", updateSettings);
app.use("/deleteAccount", deleteAccount);
app.use("/logout", logout);
app.use("/addTrack", addTrack);
app.use("/updateTrack", updateTrack);
app.use("/deleteTrack", deleteTrack);
app.use("/activity", activity);

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => console.log("Running on port " + PORT));


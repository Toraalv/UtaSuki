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
	user: "",
	password: "",
	database: "utasuki",
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
				en: "User doesn't exist.",
				code: "error.user_not_found"
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
	}

	let years = [...new Set(data.map((item) => item.date.getFullYear()))]; // tar ut unika år, 凄い

	res.status(200).json({
		status: "OK",
		version: VERSION,
		years: years
	});
});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => { console.log("Running on port " + PORT); });

// skicka vilken sql-fråga somhelst, gör man såhär?
async function dbQuery(query) {
	return new Promise(function(resolve, reject) {
		try {
			pool.getConnection().then(conn => {
				conn.query(query).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) { console.log(e); }
	});
}


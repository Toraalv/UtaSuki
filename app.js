const express = require("express");
const app = express();
const port = 17720;
const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
const https = require("https");

// certificate part
const privateKey = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
// ----------------

// base pages
const indexHTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
const baseYearHTML = fs.readFileSync(path.resolve(__dirname, "base_year.html"), "utf8");

const helper = require("./public/javascript/helper.js");

// add track bit
const multer = require("multer");
const { body, validationResult } = require("express-validator");

const handleError = (err, res) => {
	res
		.status(500)
		.contentType("text/plain")
		.end("Something went wrong.");
};

const upload = multer({
	dest: "./public/temp/"
});
// -------------

// only used for jsonToSQL
// var TrackJSON = require("./public/Tracks.json");

// db connection
const mariadb = require('mariadb');
const pool = mariadb.createPool({
	socketPath: "/run/mysqld/mysqld.sock", // すげぇ、効率的だわ
	user: process.env.UTASUKI_DB_USER, 
	password: process.env.UTASUKI_DB_PASS,
	database: port == 17720 ? "utasuki_testing" : process.env.UTASUKI_DB_DATABASE,
	connectionLimit: 5
});

// express stuff
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json());       
app.use(express.urlencoded({extended: true})); 

// add track form
app.post("/add_track", upload.single("file"), async (req, res) => {
	console.log(req.ip);

	const tempPath = req.file.path;
	if (req.ip == "::ffff:85.226.30.212") { // this is shit
		// hello???? sql injection department???
		let selectedYear = req.body.selected_year;
		let selectedMonth= req.body.selected_month;
		let selectedDate = `${selectedYear}-${selectedMonth}-15`;
		let title = req.body.title;
		let artist = req.body.artist;
		let album = req.body.album;
		let description = req.body.description;
		let lastedit = "";

		let imageExt = path.extname(req.file.originalname).toLowerCase();
		let newImgName = `${title}_${artist}_${album}${imageExt}`;
		const targetPath = path.join(__dirname, `./public/images/album covers/${newImgName}`);

		if (imageExt == ".png" || imageExt == ".jpg" || imageExt == ".jpeg") {
			// find out if track already exists
			let trackExist = await dbQuery(`SELECT id FROM tracks WHERE artist = "${artist}" AND title = "${title}"`);
			if (trackExist.length == 0) {
				let trackInsertRes = await dbQuery(`INSERT INTO tracks (artist, album, title, released, image) VALUES ("${artist}", "${album}", "${title}", "0000-00-00", "static/images/album covers/${newImgName}")`);
				let user_trackInsertRes = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date,${lastedit == "" ? "" : "last_edit,"} description) VALUES ("1", "${trackInsertRes.insertId.toString()}", "${selectedDate}", ${lastedit == "" ? "" : '"' + lastedit + '", '} "${description}")`);
				fs.rename(tempPath, targetPath, err => {
					if (err) return handleError(err, res);
					res.redirect(`/year=${selectedYear}`);
				});
			} else {
				// find out if track already exists on the same date
				let userTrackExist = await dbQuery(`SELECT 1 FROM user_tracks WHERE track_id = "${trackExist[0].id}" AND uid = "1" AND date = "${selectedDate}"`);
				if (userTrackExist.length == 0)
					dbQuery(`INSERT INTO user_tracks (uid, track_id, date,${lastedit == "" ? "" : "last_edit,"} description) VALUES ("1", "${trackExist[0].id}", "${selectedDate}", ${lastedit == "" ? "" : '"' + lastedit + '", '} "${description}")`);
				else {
					res.redirect("/add_track");
					console.log("that track already exists on the same date"); // todo: let the user know
				}
			}
		} else res.redirect("/add_track");
	} else res.sendFile(__dirname + "/public/images/Angy Wamy.png");

	fs.unlink(tempPath, err => { if (err) return handleError(err, res); });
});

// main page
app.get("/", async (req, res) => {
    let indexDOM =  new jsdom.JSDOM(indexHTML);
    const $ = require("jquery")(indexDOM.window);

	let tracks = await dbQuery(`SELECT *  
								FROM tracks
								JOIN user_tracks ON tracks.id = user_tracks.track_id
								WHERE user_tracks.uid = 1
								ORDER BY user_tracks.date`);

	let listYears = new Array();
    let dup = 0;
    for (let i = 0; i < tracks.length; i++)
    {
        if (listYears[i - 1 - dup] == tracks[i].date.getFullYear())
        {
            dup++;
            continue;
        }
        listYears.push(tracks[i].date.getFullYear());
    }
    
    for (let i = 0; i < listYears.length; i++)
    {
        $("main").append(`<a href='/year=${listYears[i]}' class='yearContainer'><h1>${listYears[i]}</h1></a>`);
    }
	if (port == 17720)
		$("main").append(`<a href='/' class='yearContainer'><h1>utasuki dev mode</h1></a>`);

    res.send(indexDOM.serialize());
});

// pages for every year
app.get("/year=*", async (req, res) =>
{
    let baseYearDOM = new jsdom.JSDOM(baseYearHTML);
    const $ = require("jquery")(baseYearDOM.window);

    let reqYear = req.params["0"];

    $("#title").text(reqYear);

	let tracks = await dbQuery(`SELECT *  
								FROM tracks
								JOIN user_tracks ON tracks.id = user_tracks.track_id
								WHERE user_tracks.uid = 1
								ORDER BY user_tracks.date`);

	let yearTracks = new Array();
    // gets all tracks specified by reqYear
    for (let i = 0; i < tracks.length; i++)
        if (tracks[i].date.getFullYear() == reqYear)
            yearTracks.push(tracks[i]);

	let monthFlag = new Array();
	for (let i = 1; i < 13; i++)
		monthFlag[i] = false; // initialise flag with falses

	let fieldset = $("<fieldset>").addClass("trackContainer");
	for (let i = 0; i < yearTracks.length; i++) {
		let currentMonth = yearTracks[i].date.getMonth() + 1;
		if (!monthFlag[currentMonth]) {
			fieldset = $("<fieldset>").addClass("trackContainer")
			let legend = $("<legend>").text(`${helper.monthToString(currentMonth)}`);
			fieldset.html(legend);
			monthFlag[currentMonth] = true;
		}

		let trackDiv = $("<div>").addClass("track");
			
		let trackImg = $("<img>");
		if (yearTracks[i].image == "" && i % 2 == 0)
			$(trackImg).attr("src", "static/images/lowres_suisei.png");
		else if (yearTracks[i].image == "" && !(i % 2 == 0))
			$(trackImg).attr("src", "static/images/server-icon.png");
		else
			$(trackImg).attr("src", yearTracks[i].image);

		let trackInfo = $("<div>").addClass("trackInfo");
		let trackTitle = $("<h1>").text(yearTracks[i].title);
		let artistName = $("<h3>").text(yearTracks[i].artist);
		let description = $("<p>").text(yearTracks[i].description);
		let lastedit = $("<h5>").text(yearTracks[i].last_edit == null ? "" : "Last edit: " +
										yearTracks[i].last_edit.getFullYear() + "-" + // yea we out here ternarin'
										(yearTracks[i].last_edit.getMonth() + 1 < 10 ? "0" + (yearTracks[i].last_edit.getMonth() + 1) : (yearTracks[i].last_edit.getMonth() + 1)) + "-" +
										(yearTracks[i].last_edit.getDate() < 10 ? "0" + yearTracks[i].last_edit.getDate() : yearTracks[i].last_edit.getDate()));

		$(trackInfo).append(trackTitle);
		$(trackInfo).append(artistName);
		$(trackInfo).append(description);
		$(trackInfo).append(lastedit);

		$(trackDiv).append(trackImg);
		$(trackDiv).append(trackInfo);

		$(fieldset).append(trackDiv);
		// maybe an exaggeration
		$("#trackItemList").append(fieldset);
	}
	
	res.send(baseYearDOM.serialize());
});

app.get("/add_track", (req, res) => {
	res.sendFile(__dirname + "/add_track.html"); 
 });

app.get("/jsonToSQL", (req, res) => {
	// jsonToSQL();
 });

app.all("*", (req, res) => { // for everything else
	res.send("<h1><b>404 not found</h1>");
});

// app.listen(port, () => {
// 	console.log("Running on port " + port);
// });

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log("Running on port " + port);

});

// send any query via this, feels illegal, idk
async function dbQuery(query) {
	return new Promise(function(resolve, reject){
		try {
			pool.getConnection().then(conn => {
				conn.query(query).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) {
			console.log(e); // wish I knew what I'm doing
		}
	});
}










// leaving this as a memory
async function jsonToSQL() {
	let bruh = 0;
	for (let i = 0; i < TrackJSON.length; i++) {
		for (let j = 0; j < TrackJSON[i].tracks.length; j++) {
			bruh++;
		}
	}
	console.log(bruh);

	for (let i = 0; i < TrackJSON.length; i++) {
		let currentDate = TrackJSON[i].date + "-15"; // batshit crazy, if 00 then 2020-02-00 actually becomes 2020-01-31, goddamn
		console.log(currentDate);
		for (let j = 0; j < TrackJSON[i].tracks.length; j++) {
			let trackExist = await dbQuery(`SELECT id FROM tracks WHERE artist = "${TrackJSON[i].tracks[j].artist}" AND title = "${TrackJSON[i].tracks[j].trackname}"`)
			if (trackExist.length == 0) {
				let trackInsertRes = await dbQuery(`INSERT INTO tracks (artist, album, title, released, image) VALUES ("${TrackJSON[i].tracks[j].artist}", "${TrackJSON[i].tracks[j].album}", "${TrackJSON[i].tracks[j].trackname}", "0000-00-00", "${TrackJSON[i].tracks[j].image}")`);
				let user_trackInsertRes = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date,${TrackJSON[i].tracks[j].lastedit == "" ? "" : "last_edit,"} description) VALUES ("1", "${trackInsertRes.insertId.toString()}", "${currentDate}", ${TrackJSON[i].tracks[j].lastedit == "" ? "" : '"' + TrackJSON[i].tracks[j].lastedit + '", '} "${TrackJSON[i].tracks[j].description}")`);
			} else {
				console.log(trackExist[0].id);
				let user_trackInsertRes = await dbQuery(`INSERT INTO user_tracks (uid, track_id, date,${TrackJSON[i].tracks[j].lastedit == "" ? "" : "last_edit,"} description) VALUES ("1", "${trackExist[0].id}", "${currentDate}", ${TrackJSON[i].tracks[j].lastedit == "" ? "" : '"' + TrackJSON[i].tracks[j].lastedit + '", '} "${TrackJSON[i].tracks[j].description}")`);
			}
		}
		
	}
}
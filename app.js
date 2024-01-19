const express = require("express");
const app = express();
const port = 17720;
const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");

const indexHTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
const baseYearHTML = fs.readFileSync(path.resolve(__dirname, "base_year.html"), "utf8");
const helper = require("./public/javascript/helper.js");

// only used for jsonToSQL
// var TrackJSON = require("./public/Tracks.json");

const mariadb = require('mariadb');
const pool = mariadb.createPool({
	socketPath: "/run/mysqld/mysqld.sock", // すげぇ、効率的だわ
	user: process.env.UTASUKI_DB_USER, 
	password: process.env.UTASUKI_DB_PASS,
	database: process.env.UTASUKI_DB_DATABASE,
	connectionLimit: 5
});

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json());       
app.use(express.urlencoded({extended: true})); 

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

    res.send(indexDOM.serialize());
});

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

app.listen(port, () => {
	console.log("Running on port " + port);
});

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
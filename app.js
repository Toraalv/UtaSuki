const express = require("express");
const app = express();
const port = 17720;
const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");

const indexHTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
const baseYearHTML = fs.readFileSync(path.resolve(__dirname, "base_year.html"), "utf8");
const helper = require("./public/javascript/helper.js");

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

	let tracks = await dbSelect(`SELECT *  
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

    // Fixa title
    $("#title").text(reqYear);

	let tracks = await dbSelect(`SELECT *  
								FROM tracks
								JOIN user_tracks ON tracks.id = user_tracks.track_id
								WHERE user_tracks.uid = 1
								ORDER BY user_tracks.date`);

	let yearTracks = new Array();
    // Hämtar alla månader utifrån reqYear
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
			
		// Lägger in bilden, om den inte finns så läggs varannan Suisei och Pekora
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
										yearTracks[i].last_edit.getFullYear() + "-" +
										yearTracks[i].last_edit.getMonth() + "-" +
										(yearTracks[i].last_edit.getDate() < 10 ? "0" + yearTracks[i].last_edit.getDate() : yearTracks[i].last_edit.getDate()));

		$(trackInfo).append(trackTitle);
		$(trackInfo).append(artistName);
		$(trackInfo).append(description);
		$(trackInfo).append(lastedit);

		$(trackDiv).append(trackImg);
		$(trackDiv).append(trackInfo);

		$(fieldset).append(trackDiv);
		// a miracle that I can run this every iteration
		// why? because even though the fieldset has been added already, new tracks will still be appended to
		// the correct fieldset because I only renew the fieldset when a new month has been detected. 
		// before I had an extra for-loop to fix this. cheers
		$("#trackItemList").append(fieldset);
	}
	
	res.send(baseYearDOM.serialize());
});

app.get("/add_track", (req, res) => {
	res.sendFile(__dirname + "/add_track.html"); 
 });

app.all("*", (req, res) => { // for everything else
	res.send("<h1><b>404 not found</h1>");
});

app.listen(port, () => {
	console.log("Running on port " + port);
});

async function dbSelect(query) {
	return new Promise(function(resolve, reject){
		try {
			pool.getConnection().then(conn => {
				conn.query(query).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
			}).catch(e => reject(e));
		} catch (e) {
			console.log(e); // önskar jag visste vad fan jag håller på med
		}
	});
}
const express = require("express");
const app = express();
const port = 443;
const path = require("path");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/utasuki.toralv.dev/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use("/static", express.static(path.join(__dirname, "public")));

// everything under this is the same as debug version


app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json());       
app.use(express.urlencoded({extended: true})); 

const multer = require("multer");
var TrackJSON = require("./public/json/Tracks.json");
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

app.post("/add_item", upload.single("file"), (req, res) => {
	console.log(req.ip);

	const tempPath = req.file.path;
	if (req.ip == "::ffff:127.0.0.1" || req.ip == "::ffff:78.69.242.24" || req.ip == "::ffff:155.4.167.26") { // i ain't got no time for passwords
		const targetPath = path.join(__dirname, `./public/images/cover art/${req.file.originalname}`);

		let selectedYear = req.body.selected_year;
		let selectedMonth= req.body.selected_month;
		let selectedDate = parseInt(selectedYear + selectedMonth);
		let trackName = req.body.track_name;
		let artistName = req.body.artist_name;
		let albumName = req.body.album_name;
		let description = req.body.description;
		

		imageExt = path.extname(req.file.originalname).toLowerCase();
		if (imageExt == ".png" || imageExt == ".jpg") {
			// adding form info into json
			oldestDate = parseInt(TrackJSON[0].date.split("-")[0] + TrackJSON[0].date.split("-")[1]);
			newestDate = parseInt(TrackJSON[TrackJSON.length - 1].date.split("-")[0] + TrackJSON[TrackJSON.length - 1].date.split("-")[1]);

			// imperfect, doesn't handle all cases. I'll do this some other time
			if (selectedDate < oldestDate) {
				TrackJSON.unshift(
					{
						date: `${selectedYear}-${selectedMonth}`,
						tracks: [
							{
								artist: artistName,
								album: albumName,
								trackname: trackName,
								image: `static/images/cover art/${albumName}${imageExt}`,
								description: description
							}
						]
					}
				)
			} else if (selectedDate > newestDate) {
				TrackJSON.push(
					{
						date: `${selectedYear}-${selectedMonth}`,
						tracks: [
							{
								artist: artistName,
								album: albumName,
								trackname: trackName,
								image: `static/images/cover art/${albumName}${imageExt}`,
								description: description
							}
						]						
					}
				)
			} else {
				for (let i = 0; i < TrackJSON.length; i++) { // if the selected year exists
					let trackDate = parseInt(TrackJSON[i].date.split("-")[0] + TrackJSON[i].date.split("-")[1]);
					if (trackDate == selectedDate) {
						TrackJSON[i].tracks.push(
							{
								artist: artistName,
								album: albumName,
								trackname: trackName,
								image: `static/images/cover art/${albumName}${imageExt}`,
								description: description
							}
						);
					}
				}
			}
			
			// writing back to file
			fs.writeFile("./public/json/Tracks.json", JSON.stringify(TrackJSON, null, 4), (error) => {
				console.log("Track.json updated");
				if (error) throw error;
			});

			fs.rename(tempPath, targetPath, err => {
				if (err) return handleError(err, res);
				res.redirect(`/year=${selectedYear}`);
			});
		} else {
			fs.unlink(tempPath, err => {
				if (err) return handleError(err, res);
  
				res.redirect("/add_item");
			});
		}
	} else {
		fs.unlink(tempPath, err => {
			if (err) return handleError(err, res);

			res.sendFile(__dirname + "/public/images/Angy Wamy.png");
		});
	}
});

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/add_item", (req, res) => {
   res.sendFile(__dirname + "/add_item.html"); 
});

app.get("/year=*", (req, res) => {
	res.sendFile(__dirname + "/base_year.html");
});

app.all("*", (req, res) => { // for everything else
	res.send("<h1><b>404 not found</h1>");
});

// until here

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log("Running on port " + port);
});
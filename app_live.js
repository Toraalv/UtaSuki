const express = require("express");
const app = express();
const port = 443;
const path = require("path");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync('/etc/letsencrypt/live/toralv.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/toralv.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/toralv.dev/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use("/static", express.static(path.join(__dirname, "public")));


app.get("/", (req, res) =>
{
	res.sendFile(__dirname + "/index.html");
});

app.get("/add_item", (req, res) =>
{
   res.sendFile(__dirname + "/add_item.html"); 
});

app.get("/year=*", (req, res) => {
	res.sendFile(__dirname + "/base_year.html");
});

app.all("*", (req, res) => { // for everything else
	res.send("<h1><b>404 not found</h1>");
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log("Running on port " + port);
});
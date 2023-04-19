const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");

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

app.listen(port, () => {
	console.log("Running on port " + port);
});
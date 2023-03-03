const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
var trackJSON = require("./public/json/Tracks.json");

const indexHTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
const baseYearHTML = fs.readFileSync(path.resolve(__dirname, "base_year.html"), "utf8");
const appHelper = require("./public/javascripts/app_helper.js");

app.use("/static", express.static(path.join(__dirname, "public")));


app.get("/", (req, res) =>
{
    let indexDOM =  new jsdom.JSDOM(indexHTML);
    const $ = require("jquery")(indexDOM.window);

    let listYears = new Array();
    let dup = 0;
    for (let i = 0; i < trackJSON.length; i++)
    {
        if (listYears[i - 1 - dup] == trackJSON[i].date.substring(0, 4))
        {
            dup++;
            continue;
        }
        listYears.push(trackJSON[i].date.substring(0, 4));
    }
    
    for (let i = 0; i < listYears.length; i++)
    {
        $("main").append(`<a href='year=${listYears[i]}' class='yearContainer'><h1>${listYears[i]}</h1></a>`);
    }

    res.send(indexDOM.serialize());
});

app.get("/add_item", (req, res) =>
{
   res.sendFile(__dirname + "/add_item.html"); 
});

app.get("/year=*", (req, res) =>
{
    let baseYearDOM = new jsdom.JSDOM(baseYearHTML);
    const $ = require("jquery")(baseYearDOM.window);

    let reqYear = req.params["0"];

    // Fixa title
    $("#title").text(reqYear);

    let trackList = new Array();
    // Hämtar alla månader utifrån reqYear
    for (let i = 0; i < trackJSON.length; i++)
        if (trackJSON[i].date.substring(0, 4) == reqYear)
            trackList.push(trackJSON[i]);
    
    for (let i = 0; i < trackList.length; i++)
    {
        let fieldset = $("<fieldset>").addClass("trackContainer");
        let legend = $("<legend>").text(`${appHelper.monthToString(trackList[i].date.substring(5, 7))}`);
        fieldset.html(legend);////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        for (let j = 0; j < trackList[i].tracks.length; j++)
        {
            let trackDiv = $("<div>").addClass("track");
            
            // Lägger in bilden, om den inte finns så läggs varannan Suisei och Pekora
            let trackImg = $("<img>");
            if (trackList[i].tracks[j].image == "" && j % 2 == 0)
                $(trackImg).attr("src", "static/images/lowres_suisei.png");
            else if (trackList[i].tracks[j].image == "" && !(j % 2 == 0))
                $(trackImg).attr("src", "static/images/server-icon.png");
            else
                $(trackImg).attr("src", trackList[i].tracks[j].image);

            let trackInfo = $("<div>").addClass("trackInfo");
            let trackName = $("<h1>").text(trackList[i].tracks[j].trackname);
            let artistName = $("<h3>").text(trackList[i].tracks[j].artist);

            $(trackInfo).append(trackName);
            $(trackInfo).append(artistName);

            $(trackDiv).append(trackImg);
            $(trackDiv).append(trackInfo);

            $(fieldset).append(trackDiv);
        }

        $("#trackItemList").append(fieldset);
    }

    res.send(baseYearDOM.serialize());
});

app.all("*", (req, res) => { // for everything else
    res.send("<h1><b>404 not found</h1>");
});

app.listen(port, () => {
    console.log("Running on port " + port);
});
"use strict";

import { monthToString } from "./helper.js";

$(async function() {
	let reqYear = window.location.pathname.split("year=")[1];

	let rawTracklist = new Array();
	await $.get("/static/json/Tracks.json", (data) => {
		rawTracklist = data;
	});
	let tracklist = new Array();
	for (let i = 0; i < rawTracklist.length; i++)
		if (rawTracklist[i].date.substring(0, 4) == reqYear)
			tracklist.push(rawTracklist[i]);

	buildPage(tracklist, reqYear);
});

function buildPage(tracklist, reqYear) {
	$("#title").text(reqYear);

	for (let i = 0; i < tracklist.length; i++)
	{
		let fieldset = $("<fieldset>").addClass("trackContainer");
		let legend = $("<legend>").text(`${monthToString(tracklist[i].date.substring(5, 7))}`);
		fieldset.html(legend);////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		for (let j = 0; j < tracklist[i].tracks.length; j++)
		{
			let trackDiv = $("<div>").addClass("track");
			
			// Lägger in bilden, om den inte finns så läggs varannan Suisei och Pekora
			let trackImg = $("<img>");
			if (tracklist[i].tracks[j].image == "" && j % 2 == 0)
				$(trackImg).attr("src", "static/images/lowres_suisei.png");
			else if (tracklist[i].tracks[j].image == "" && !(j % 2 == 0))
				$(trackImg).attr("src", "static/images/server-icon.png");
			else
				$(trackImg).attr("src", tracklist[i].tracks[j].image);

			let trackInfo = $("<div>").addClass("trackInfo");
			let trackName = $("<h1>").text(tracklist[i].tracks[j].trackname);
			let artistName = $("<h3>").text(tracklist[i].tracks[j].artist);
			let description = $("<p>").text(tracklist[i].tracks[j].description);
			let lastedit = $("<h5>").text(tracklist[i].tracks[j].lastedit == "" ? "" : "Last edit: " + tracklist[i].tracks[j].lastedit);

			$(trackInfo).append(trackName);
			$(trackInfo).append(artistName);
			$(trackInfo).append(description);
			$(trackInfo).append(lastedit);

			$(trackDiv).append(trackImg);
			$(trackDiv).append(trackInfo);

			$(fieldset).append(trackDiv);
		}

		$("#trackItemList").append(fieldset);
	}
}
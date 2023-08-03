$(async function() {
    let rawTracklist = new Array();
	await $.get("/static/json/Tracks.json", (data) => {
		rawTracklist = data;
	});

    let listYears = new Array();
	let dup = 0;
	for (let i = 0; i < rawTracklist.length; i++)
	{
		if (listYears[i - 1 - dup] == rawTracklist[i].date.substring(0, 4))
		{
			dup++;
			continue;
		}
		listYears.push(rawTracklist[i].date.substring(0, 4));
	}
	
	for (let i = 0; i < listYears.length; i++)
	{
		$("main").append(`<a href='/year=${listYears[i]}' class='yearContainer'><h1>${listYears[i]}</h1></a>`);
	}
});
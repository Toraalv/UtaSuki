const express = require("express");
const app = express();
const port = 17720;
const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");

const indexHTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");

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
	// console.log(tracks);
	// let years = new Array;
	for (let i = 0; i < tracks.length; i++)
		console.log(tracks[i].date.toString().split(" ")[3]);
    // $("#cum").text((await dbSelect("select * from users"))[0].username);
	// $("main").append(`<p>${letItRip("select * from users")}</p>`);

	let listYears = new Array();
    let dup = 0;
    for (let i = 0; i < tracks.length; i++)
    {
        if (listYears[i - 1 - dup] == tracks[i].date.toString().split(" ")[3])
        {
            dup++;
            continue;
        }
        listYears.push(tracks[i].date.toString().split(" ")[3]);
    }
    
    for (let i = 0; i < listYears.length; i++)
    {
        $("main").append(`<a href='/year=${listYears[i]}' class='yearContainer'><h1>${listYears[i]}</h1></a>`);
    }

    res.send(indexDOM.serialize());
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
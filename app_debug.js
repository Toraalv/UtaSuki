const express = require("express");
const app = express();
const port = 1770;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

app.use("/static", express.static(path.join(__dirname, "public")));

const handleError = (err, res) => {
	res
		.status(500)
		.contentType("text/plain")
		.end("Something went wrong.");
};

const upload = multer({
	dest: "./public/temp/"
})

app.post("/add_item", upload.single("file"), (req, res) => {
	console.log(req.ip);
	const tempPath = req.file.path;
	if (req.ip == "::ffff:127.0.0.1" || req.ip == "::ffff:78.69.242.24") { // i ain't got no time for passwords
		const targetPath = path.join(__dirname, `./uploads/${req.file.originalname}`);
  
		if (path.extname(req.file.originalname).toLowerCase() == ".png" || path.extname(req.file.originalname).toLowerCase() == ".jpg") {
			fs.rename(tempPath, targetPath, err => {
				if (err) return handleError(err, res);
  
				res.redirect("/");
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

			res.sendFile(__dirname + "/public/images/Angy Wamy.png")
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

app.listen(port, () => {
	console.log("Running on port " + port);
});
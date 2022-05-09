//"use strict"

const http = require("http");
const fs = require("fs");
const jsdom = require("jsdom");
const path = require("path");
var songs = require("./Songs.json");


http.createServer(function(req, res)
{
    let filePath = (req.url === "/") ? "index.html" : req.url.substring(1); // if(thing) ? true-stuff : false-stuff;
    let extName = path.extname(filePath);
    if (extName == "")
        filePath += ".html";

    let year = null;
    if (filePath.substring(0, 5) == "year=")
    {
        year = filePath.substring(5, 9);
        filePath = "base_year.html";
    }

    fs.readFile(filePath, function(err, data)
    {
        if (err)
        {
            res.writeHead(404, { "Content-Type" : "text/html" });
            res.end();
        } else
        {
            let contentType = "text/html";
            switch (extName)
            {
                case ".css":
                    contentType = "text/css";
                    break;
                case ".js":
                    contentType = "text/javascript";
                    break;
                case ".png":
                    contentType = "image/png";
                    break;
                case ".jpg":
                    contentType = "image/jpg";
                    break;
                case ".gif":
                    contentType = "image/gif";
                    break;
                case ".svg":
                    contentType = "image/svg+xml";
                    break;
                case ".json":
                    contentType = "application/json";
                    break;
            }
            res.writeHead(200, { "Content-Type" : contentType });

            let serverDOM = new jsdom.JSDOM(data);
            let doc = serverDOM.window.document;

            switch(filePath)
            {
                case "index.html":
                    res.write(serverDOM.serialize());
                    res.end();
                    break;
                case "base_year.html":
                    let title = doc.querySelector("#title");
                    let titleh1 = doc.createElement("h1");
                    let songItemsDiv = doc.querySelector("#songItems");

                    function yearPages(year)
                    {
                        titleh1.append(doc.createTextNode(year));
                        title.replaceWith(titleh1);

                        eval("var songs" + year + "= " + "new Array" + ";");


                        for (let i = 0; i < songs.length; i++)
                            if (songs[i].date.substring(0, 4) == year)
                                eval("songs" + year).push(songs[i]);

                        songItemsDiv = doc.querySelector("#songItems");

                        for (let i = 0; i < eval("songs" + year).length; i++)
                        {
                            //div class="songContainer"
                            let songContainer = doc.createElement("div");
                            songContainer.className = "songContainer";

                            //fieldset
                            let fieldset = doc.createElement("fieldset");
                            //legend YYYY-MM
                            let legend = doc.createElement("legend");
                            legend.append(doc.createTextNode(eval("songs" + year)[i].date.substring(5, 7)))
                            fieldset.append(legend);

                            for (let j = 0; j < eval("songs" + year)[i].songList.length; j++)
                            {
                                //div class="song"
                                let songDiv = doc.createElement("div");
                                songDiv.className = "song";

                                //img src=eval("songs" + year)[i].image
                                let img = doc.createElement("img");
                                if (eval("songs" + year)[i].songList[j].image == "" && j % 2 == 0)
                                    img.setAttribute("src", "images/lowres_suisei.png");
                                else if (eval("songs" + year)[i].songList[j].image == "" && !(j % 2 == 0))
                                    img.setAttribute("src", "images/server-icon.png");
                                else
                                    img.setAttribute("src", eval("songs" + year)[i].songList[j].image);
                                
                                //div class="songInfo"
                                let songInfo = doc.createElement("div");
                                songInfo.className = "songInfo";
                                //h1 song name
                                let songName = doc.createElement("h1");
                                songName.append(doc.createTextNode(eval("songs" + year)[i].songList[j].song));
                                //h3 artist
                                let artist = doc.createElement("h3")
                                artist.append(doc.createTextNode(eval("songs" + year)[i].songList[j].artist));

                                //Add everything
                                songInfo.append(songName);
                                songInfo.append(artist);

                                songDiv.append(img);
                                songDiv.append(songInfo);

                                fieldset.append(songDiv);
                            }
                            songContainer.append(fieldset);

                            songItemsDiv.append(songContainer);
                        }

                        res.write(serverDOM.serialize());
                        res.end();
                    }
                    yearPages(year);
                    break;
                default:
                    let content = fs.readFileSync(filePath);
                    res.write(content);
                    res.end();
                    break;
            }
        }
    });
}).listen(1770);
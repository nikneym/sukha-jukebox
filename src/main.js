import express from "express";
import { readFileSync } from "fs";
import bodyParser from "body-parser";
import Spotify from "./spotify.js";

let data = readFileSync("credentials");
const credentials = data.toString().split("\n");

const spotify = new Spotify({
  clientId: credentials[0],
  clientSecret: credentials[1],
  refreshToken: credentials[2]
});

// express app
const app = express();

// app config
app.use(express.static("./public"));
app.set("views", "./public");
app.set("view engine", "html");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// index
app.get("/", (req, res) => {
  res.render("index");
});

// Serves a JSON for desired queries
app.get("/search/:value", async (req, res) => {
  const q = req.params.value;
  if (!q || q === "") {
    return res.json({ error: 400 });
  }
  const tracks = await spotify.search({
    q: q,
    limit: 4,
    offset: 0
  });

  if (tracks === undefined) {
    return res.json({
      q: q,
      error: 400
    });
  }

  return res.json({
    q: q,
    items: tracks
  });
});

// TODO: rate limiting
// will help to keep track of the played tracks
let lastPlayedId;

// Adds a track to queue, or not!
app.post("/que", async (req, res) => {
  const id = req.body.id;
  if (id === lastPlayedId) {
    return res.json({
      status: false,
      message: "Parça zaten sıraya eklendi."
    });
  }

  if (!id) {
    return res.json({
      status: false,
      message: "Parça sıraya eklenemedi!"
    });
  }

  const isOkay = await spotify.checkTrack(id);
  if (!isOkay) {
    return res.json({
      status: false,
      message: "Bu türde parçaları çalamıyoruz!"
    });
  }

  const queued = await spotify.addToQueue(id);
  if (!queued) {
    return res.json({
      status: false,
      message: "Görünüşe göre kafe şuan sessiz..."
    });
  }

  lastPlayedId = id;
  return res.json({
    status: true,
    message: "Parçan sıraya eklendi!"
  });
});

console.log("up @ http://localhost:8080/");
app.listen(8080);
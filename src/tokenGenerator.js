import SpotifyWebApi from "spotify-web-api-node";
import express from "express";
import { readFileSync } from "fs";

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify"
];

const data        = readFileSync("credentials");
const credentials = data.toString().split("\n");

const spotify = new SpotifyWebApi({
  clientId: credentials[0],
  clientSecret: credentials[1],
  redirectUri: "http://localhost:3000/callback"
});

const app = express();

app.get("/", (req, res) => {
  res.redirect(spotify.createAuthorizeURL(scopes));
});

app.get("/callback", (req, res) => {
  spotify.authorizationCodeGrant(req.query.code)
    .then(data => {
      res.send(data.body["refresh_token"]);
      console.log(data.body["refresh_token"]);
    });
});

console.log("up @ http://localhost:3000/");
app.listen(3000);
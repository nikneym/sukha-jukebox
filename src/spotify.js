import SpotifyWebApi from "spotify-web-api-node";

const artistsWhitelist = [
  "Red Hot Chili Peppers",
  "Arctic Monkeys",
  "John Mayer",
  "SIAMES",
  "George Michael",
  "Wham!",
  "B.B. King",
  "Albert King",
  "Richie Kotzen",
  "Stavroz",
  "Jimi Hendrix",
  "Guns N' Roses",
  "Michael Jackson"
];

const genresBlacklist = [
  "pop",
  "turkish",
  "turkce",
  "metal",
  "thrash",
  "punk",
  "emo",
  "pixie",
  "traditional",
  "rap",
  "hip hop",
  "trap",
  "lgbt",
  "house",
  "parody",
  "drill",
  "edm",
  "cumbia",
  "latin",
  "aussietronica",
  "k-pop",
  "korean",
  "skate",
  "screamo",
  "children",
  "carioca",
  "consciente",
  "ostentacao",
  "paulista"
];

class Spotify {
  constructor({ clientId: clientId, clientSecret: clientSecret, refreshToken: refreshToken }) {
    this.client = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret
    });

    this.client.setRefreshToken(refreshToken);
  }

  async refresh() {
    return this.client.refreshAccessToken()
      .then(data => {
        this.client.setAccessToken(data.body["access_token"]);
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  search({ q: q, limit: limit, offset: offset }) {
    return this.client.searchTracks(q, {
      limit: Math.abs(limit),
      offset: Math.abs(offset)
    })
    .then(data => {
      if (!data.body.tracks.items.length || data.body.tracks.items.length === 0) { return }
      const tracks = [];

      for (let track of data.body.tracks.items) {
        tracks.push({
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          cover: track.album.images[2].url,
          id: track.id,
        });
      }

      return tracks;
    })
    .catch(async data => {
      switch (data.statusCode) {
        case 401:
          const refreshStatus = await this.refresh();
          if (!refreshStatus) { return }
          return this.search({ q: q, limit: limit, offset: offset });
        default:
          console.log("error @ searchTracks");
          return;
      }
    });
  }

  addToQueue(id) {
    return this.client.addToQueue("spotify:track:" + id)
      .then(data => {
        return true;
      })
      .catch(async data => {
        switch (data.statusCode) {
          case 401:
            const refreshStatus = await this.refresh();
            if (!refreshStatus) { return false }
            return this.addToQueue(id);
          default:
            console.log("error @ addToQueue");
            return false;
        }
      });
  }

  async getArtistFromTrack(id) {
    return this.client.getTrack(id)
      .then(data => {
        if (data.body.artists.length === 0) { return }
        return {
          name: data.body.artists[0].name,
          id: data.body.artists[0].id
        }
      })
      .catch(async data => {
        switch (data.statusCode) {
          case 401:
            const refreshStatus = await this.refresh();
            if (!refreshStatus) { return }
            return this.getArtistFromTrack(id);
          default:
            console.log("error @ getTrack");
            return;
        }
      });
  }

  getGenres(id) {
    return this.client.getArtist(id)
      .then(data => {
        if (data.body.genres.length === 0) { return }
        //console.log(data.body.genres);
        return data.body.genres;
      })
      .catch(async data => {
        switch (data.statusCode) {
          case 401:
            const refreshStatus = await this.refresh();
            if (!refreshStatus) { return }
            return this.getGenres(id);
          default:
            console.log("error @ getGenres");
            return;
        }
      });
  }

  async checkTrack(id) {
    const artist = await this.getArtistFromTrack(id);
    if (!artist) { return false }

    // check if artist is whitelisted
    for (let okay of artistsWhitelist) {
      if (artist.name === okay) {
        return true;
      }
    }

    const genres = await this.getGenres(artist.id);
    if (!genres) { return false }

    // check if genre is blacklisted
    for (let genre of genres) {
      for (let banned of genresBlacklist) {
        if (genre.includes(banned)) {
          return false;
        }
      }
    }

    return true;
  }
}

export default Spotify;
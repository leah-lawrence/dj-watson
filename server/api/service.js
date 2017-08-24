'use strict';

const _ = require('lodash');
const request = require('request');
const url = require('url');
const xml2js = require('xml2js');
const watsonApi = require('./watsonApi.js');

const SONGS_LIST = require('./lyricsList.json');
const LYRICS_API = 'api.lololyrics.com/0.5/getLyric';
const NO_LYRICS_RESPONSE = 'No lyric found with that artist and title';

const parseXML = (xmlString) => {
  return new Promise((resolve, reject) => {
    // Since response is XML
    xml2js.parseString(xmlString, (err, response) => {
      if (err) {
        reject(err);
      }
      else {
        resolve({
          lyrics: response.result.response.join(' '),
          album: response.result.album[0],
          year: response.result.year[0],
          cover: response.result.cover[0],
        });
      }
    });
  });
};

const getSpotifyAccessCode = () => {
  const clientId = process.env.CFCI_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.CFCI_SPOTIFY_CLIENT_SECRET;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': `Basic ${(new Buffer(
        `${clientId}:${clientSecret}`
      ).toString('base64'))}`,
    },
    form: {
      'grant_type': 'client_credentials',
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    return request.post(authOptions, (error, response, body) => {
      if (error) {
        reject(error);
      }

      if (response.statusCode === 200) {
        resolve(body.access_token);
      }
    });
  });
};

const getLyric = (artist, track) => {
  const options = {
    protocol: 'http',
    host: LYRICS_API,
    query: {
      artist,
      track,
    },
  };
  const apiUrl = url.format(options);

  return new Promise((resolve, reject) => {
    request.get(apiUrl, (error, res, body) => {
      if (error) {
        return reject(error);
      }

      return parseXML(body).then(resolve).catch(reject);
    });
  });
};

const getSpotifyTrack = (accessT, trackUri) => {
  const trackId = trackUri.replace(/spotify:track:/, '');
  const options = {
    url: `https://api.spotify.com/v1/tracks/${trackId}`,
    headers: {
      'Authorization': `Bearer ${accessT}`,
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      return resolve(body);
    });
  });
};

const delay = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

const getLyrics = () => {
  const lyrics = [];

  return getSpotifyAccessCode()
    .then(ACCESS_CODE => {
      return Promise.all(_.chunk(SONGS_LIST, 25).map(currentList => {
        return currentList.reduce((previous, current) => {
          return previous.then(() => {
            return getLyric(current.artist, current.track)
              .then(songLyrics => {
                return delay(1000)
                  .then(() => {
                    if (songLyrics.lyrics !== NO_LYRICS_RESPONSE) {
                      return getSpotifyTrack(ACCESS_CODE, current.uri)
                        .then(spotifyInfo => {
                          _.unset(spotifyInfo, 'available_markets');
                          _.unset(spotifyInfo, 'album.available_markets');
                          lyrics.push({
                            artist: current.artist,
                            track: current.track,
                            lyrics: songLyrics.lyrics,
                            album: songLyrics.album,
                            year: songLyrics.year,
                            cover: songLyrics.cover ? songLyrics.cover : undefined,
                            spotifyInfo,
                          });
                        });
                    }

                    return Promise.resolve();
                  });
              });
          });
        }, Promise.resolve());
      })).then(() => {
        return lyrics;
      });
    });
};

const postLyricsToWatson = () => {
  return getLyrics()
    .then(lyrics => {
      return watsonApi.postDataToWatson(lyrics);
    });
};

module.exports = {
  getLyrics,
  postLyricsToWatson,
  getSpotifyAccessCode,
};

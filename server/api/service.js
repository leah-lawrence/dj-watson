'use strict';

const _ = require('lodash');
const request = require('request');
const url = require('url');
const xml2js = require('xml2js');
// const watsonApi = require('./watsonApi.js');
//
const SONGS_LIST = require('./lyricsList.json');
const LYRICS_API = 'api.lololyrics.com/0.5/getLyric';
const NO_LYRICS_RESPONSE = 'No lyric found with that artist and title';
const accessToken = 'BQBwO1mJII4_0RLafFJsYY5jX0Q8l7acHZ13dT90ht3BOKibrdBxOi9GOiVh5jpkvbB2xcxaYRZgsiQISSuPTA';

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
  return new Promise((resolve, reject) => {
    setTimeout(function(){
      resolve();
    }, timeout);
  });
};

const getLyrics = () => {
  const lyrics = [];

  return Promise.all(_.chunk(SONGS_LIST, 10).map(currentList => {
    return currentList.reduce((previous, current) => {
      return previous.then(() => {
        return getLyric(current.artist, current.track)
          .then(songLyrics => {
            return getSpotifyTrack(accessToken, current.uri).then(trackinfo => {
              delay(1000);
              if (songLyrics.lyrics !== NO_LYRICS_RESPONSE) {
                lyrics.push({
                  artist: current.artist,
                  track: current.track,
                  lyrics: songLyrics.lyrics,
                  album: songLyrics.album,
                  year: songLyrics.year,
                  cover: songLyrics.cover ? songLyrics.cover : undefined,
                  spotifyInfo: trackinfo,
                });
              }
            });
          });
      });
    }, Promise.resolve());
  })).then(() => {
    return lyrics;
  });
};

const postLyricsToWatson = () => {
  return getLyrics()
    .then(lyrics => {
      return watsonApi.postDataToWatson(lyrics);
    });
};

const getAccessCode = () => {
  const clientId = '98b591974fbc4cf6932ac2ca1b6016b2';
  const clientSecret = 'e9ac2f8e613a4624ae6c9bf9c5425aa1';
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': `Basic ${(new Buffer(`${clientId}:${clientSecret}`).toString('base64'))}`,
    },
    form: {
      'grant_type': 'client_credentials',
    },
    json: true,
  };

  return request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      console.log(token);
      return token;
    }
  });
};
getAccessCode();

module.exports = {
  getLyrics,
  postLyricsToWatson,
};

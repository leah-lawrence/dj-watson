'use strict';

const _ = require('lodash');
const request = require('request');
const url = require('url');
const xml2js = require('xml2js');
const watsonApi = require('./watsonApi.js');

const SONGS_LIST = require('./lyricsList.json');
const LYRICS_API = 'api.lololyrics.com/0.5/getLyric';
const NO_LYRICS_RESPONSE = 'No lyric found with that artist and title';

module.exports = {
  getLyrics: getLyrics,
  postLyricsToWatson: postLyricsToWatson
};

function postLyricsToWatson() {
  return getLyrics()
    .then(lyrics => {
      return watsonApi.postDataToWatson(lyrics);
    })
    .then(response => {
      return response
    });
}

function getLyrics() {
  // return getLyric('adele', 'hello');
  let lyrics = [];
  return Promise.all(_.chunk(SONGS_LIST, 10).map(currentList => {
    return currentList.reduce((previous, current) => {
      return previous.then(() => {
        return getLyric(current.artist, current.track)
          .then(songLyrics => {
            console.log(`Retrieving lyrics for ${current.track} by ${current.artist}`);
            if (songLyrics.lyrics !== NO_LYRICS_RESPONSE) {
              lyrics.push({
                artist: current.artist,
                track: current.track,
                lyrics: songLyrics.lyrics,
                album: songLyrics.album,
                year: songLyrics.year,
                cover: songLyrics.cover ? songLyrics.cover : undefined
              });
            }
          });
      });
    }, Promise.resolve());
  })).then(() => {
    console.log('Complete.');
    return lyrics;
  });
}

function getLyric(artist, track) {
  let options = {
    protocol: 'http',
    host: LYRICS_API,
    query: {
      artist: artist,
      track: track
    }
  };
  let apiUrl = url.format(options);

  return new Promise((resolve, reject) => {
    request.get(apiUrl, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        return parseXML(body)
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

function parseXML(xmlString) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlString, (err, response) => {
      if (err) {
        console.error('Error Parsing JSON');
        reject(error);
      } else {
        // console.log(JSON.stringify(response, null, 2));
        resolve({
          lyrics: response.result.response.join(' '),
          album: response.result.album[0],
          year: response.result.year[0],
          cover: response.result.cover[0]
        });
      }
    });
  });
}

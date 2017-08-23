'use strict';

const _ = require('lodash');
const request = require('request');
const url = require('url');
const xml2js = require('xml2js');

const SONGS_LIST = require('./lyricsList.json');
const LYRICS_API = 'api.lololyrics.com/0.5/getLyric';
const NO_LYRICS_RESPONSE = 'No lyric found with that artist and title';

module.exports = {
  getLyrics: getLyrics
};

function getLyrics() {
  let lyrics = [];
  return Promise.all(_.chunk(SONGS_LIST, 10).map(currentList => {
    return currentList.reduce((previous, current) => {
      return previous.then(() => {
        return getLyric(current.artist, current.track)
          .then(songLyrics => {
            console.log(`Retrieving lyrics for ${current.track} by ${current.artist}`);
            if (songLyrics !== NO_LYRICS_RESPONSE) {
              lyrics.push({
                artist: current.artist,
                track: current.track,
                lyrics: songLyrics
              });
            }
          });
      });
    }, Promise.resolve());
  })).then(() => lyrics);
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
        resolve(response.result.response.join(' '));
      }
    });
  });
}
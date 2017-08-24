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

const getLyrics = () => {
  const lyrics = [];

  return Promise.all(_.chunk(SONGS_LIST, 10).map(currentList => {
    return currentList.reduce((previous, current) => {
      return previous.then(() => {
        return getLyric(current.artist, current.track)
          .then(songLyrics => {
            if (songLyrics.lyrics !== NO_LYRICS_RESPONSE) {
              lyrics.push({
                artist: current.artist,
                track: current.track,
                lyrics: songLyrics.lyrics,
                album: songLyrics.album,
                year: songLyrics.year,
                cover: songLyrics.cover ? songLyrics.cover : undefined,
              });
            }
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

module.exports = {
  getLyrics,
  postLyricsToWatson,
};

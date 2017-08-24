'use strict';

const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
const count = 100;

const discovery = new DiscoveryV1({
  'username': process.env.CFCI_WATSON_USERNAME,
  'password': process.env.CFCI_WATSON_PASSWORD,
  'version': process.env.CFCI_WATSON_VERSION,
  'version_date': process.env.CFCI_WATSON_VERSION_DATE,
});

const postPromise = (song, index) => {
  return new Promise((resolve) => {
    discovery.addDocument(
      {
        'environment_id': process.env.CFCI_WATSON_ENVIRONMENT_ID,
        'collection_id': process.env.CFCI_WATSON_COLLECTION_ID,
        'file': {
          value: Buffer.from(JSON.stringify(song), 'utf8'),
          options: {
            filename: `song${index}.json`,
          },
        },
      },
      (err, data) => {
        if (err) {
          return postPromise(song);
        }

        return resolve(data);
      }
    );
  });
};

const postDataToWatson = (songs) => {
  return Promise.all(
    songs.map((song, index) => {
      return postPromise(song, index);
    })
  );
};

const transformData = (watsonData) => {
  return watsonData.map(data => {
    Object.keys(data.enriched_lyrics.emotion.document.emotion).forEach(score => {
      data.enriched_lyrics.emotion.document.emotion[score] *= 10000; // eslint-disable-line no-param-reassign
    });

    return data;
  });
};

const getWatsonData = (callback) => {
  return discovery.query(
    {
      'environment_id': process.env.CFCI_WATSON_ENVIRONMENT_ID,
      'collection_id': process.env.CFCI_WATSON_COLLECTION_ID,
      'query_string': '',
      count,
      'offset': count * 13,
    },
    (error, data) => {
      if (error) {
        throw error;
      }

      return callback({
        totalMatches: data.matching_results,
        results: transformData(data.results),
      });
    }
  );
};

module.exports = {
  getWatsonData,
  postDataToWatson,
};

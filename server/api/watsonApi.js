let DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
let config = require('./../../local.env.json');
let fs = require('fs');
const count = 100;

module.exports = {
  getWatsonData: getWatsonData,
  postDataToWatson: postDataToWatson
}

let discovery = new DiscoveryV1({
  username: config.CFCI_WATSON_USERNAME,
  password: config.CFCI_WATSON_PASSWORD,
  version: config.CFCI_WATSON_VERSION,
  version_date: config.CFCI_WATSON_VERSION_DATE
});

function postDataToWatson(songs) {
  return Promise.all(
    songs.map((song, index) => {
      return postPromise(song, index);
    })
  );
}

function postPromise(song, index) {
  return new Promise((resolve, reject) => {
    console.log(JSON.stringify(song));
    discovery.addDocument(
      {
        environment_id: config.CFCI_WATSON_ENVIRONMENT_ID,
        collection_id: config.CFCI_WATSON_COLLECTION_ID,
        file: {
          value: Buffer.from(JSON.stringify(song), 'utf8'),
          options: {
            filename: 'song'+index+'.json'
          }
        }
      },
      function(err, data) {
        if (err) {
          console.error(err);
          postPromise(song);
        } else {
          console.log(JSON.stringify(data, null, 2));
          resolve(data);
        }
      }
    )
  });
}
function getWatsonData(callback) {

  let returnValue = [];
  return discovery.query(
    {
      environment_id: config.watson.ENVIRONMENT_ID,
      collection_id: config.watson.COLLECTION_ID,
      query_string: '',
      count: count,
      offset: count*11
    },
    function(error, data) {
      if (error !== undefined) {
        console.log('Page: ' + 0 +', Got results  0 to '  + data.results.length + ' out of ' + data.matching_results + ' results.');
        console.log(data);
        callback({
          totalMatches: data.matching_results,
          results: transformData(data.results)
        });
      } else {
        throw error;
      }
    }
  );
}

// Helper Functions
function transformData(watsonData) {
  let transformedData = watsonData.map(data => {
    let returnValue = {};
    returnValue['id'] = data.id;
    returnValue['album'] = data.album;
    returnValue['artist'] = data.artist;
    returnValue['cover'] = data.cover;
    returnValue['enriched_lyrics']  = data['enriched_lyrics']
    return returnValue;
  });
  return transformedData;
}

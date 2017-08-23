let DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
let config = require('./local.env.json');
const count = 100;

module.exports = {
  getWatsonData: getWatsonData
}

let discovery = new DiscoveryV1({
  username: config.watson.username,
  password: config.watson.password,
  version: config.watson.version,
  version_date: config.watson.version_date
});

function getWatsonData(callback) {
  let returnValue = [];
  return discovery.query(
    {
      environment_id: config.watson.ENVIRONMENT_ID,
      collection_id: config.watson.COLLECTION_ID,
      query_string: '',
      count: count,
      offset: count*0
    },
    function(error, data) {
      console.log('Page: ' + 0 +', Got results  0 to '  + data.results.length + ' out of ' + data.matching_results + ' results.');
      callback({
        totalMatches: data.matching_results,
        results: transformData(data.results)
      });
    }
  );
}

// Helper Functions
function transformData(watsonData) {
  let transformedData = watsonData.map(data => {
    let returnValue = {};
    returnValue['id'] = data.id;
    // returnValue['albumArt'] = data.albumArt;
    // returnValue['playUrl'] = data.playUrl;
    returnValue['enriched_text']  = data['enriched_text']
    return returnValue;
  });
  return transformedData;
}

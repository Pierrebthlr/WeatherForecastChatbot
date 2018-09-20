// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
const http = require('http');
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');

const host = 'api.worldweatheronline.com';
const wwoApiKey = '3db1195e2df8427fa2a152813181909';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

function parseWeatherApiResponse(body) {
  return new Promise((resolve, reject) => {
    // After all the data has been received parse the JSON for desired data
    console.log(body);
    const response = JSON.parse(body);
    if (response.data) {
      const forecast = response.data.weather[0];
      const location = response.data.request[0];
      const conditions = response.data.current_condition[0];
      const currentConditions = conditions.weatherDesc[0].value;

      // Create response
      const output = `Current conditions in the ${location.type}
      ${location.query} are ${currentConditions} with a projected high of
      ${forecast.maxtempC}°C or ${forecast.maxtempF}°F and a low of
      ${forecast.mintempC}°C or ${forecast.mintempF}°F on
      ${forecast.date}.`;
      resolve(output);
    } else {
      const logError = 'I don\'t have any information for this date on this city try with other information';
      reject(logError);
    }
  });
}

function callWeatherApi(city) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    const path = `${'/premium/v1/weather.ashx?format=json&num_of_days=1'
      + '&q='}${encodeURIComponent(city)}&key=${wwoApiKey}`;
    console.log(`API Request: ${host}${path}`);

    // Make the HTTP request to get the weather
    http.get({ host, path }, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        parseWeatherApiResponse(body).then((output) => {
          resolve(output);
        }).catch((logError) => {
          reject(logError);
        });
      });
      res.on('error', (error) => {
        const logError = `Error calling the weather API: ${error}`;
        reject(logError);
      });
    });
  });
}


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  function weatherRequest() {
    return new Promise((resolve) => {
      // City is a required parameter
      const city = request.body.queryResult.parameters['geo-city'];
      callWeatherApi(city).then((output) => {
        agent.add(output);
        resolve();
      }).catch((logError) => {
        agent.add(logError);
        resolve();
      });
    });
  }

  function fallback() {
    agent.add('I didn\'t understand');
    agent.add('I\'m sorry, can you try again?');
  }


  const intentMap = new Map();
  intentMap.set('Weather Intent', weatherRequest);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

// EXPORTS

exports.callWeatherApi = callWeatherApi;
exports.parseWeatherApiResponse = parseWeatherApiResponse;

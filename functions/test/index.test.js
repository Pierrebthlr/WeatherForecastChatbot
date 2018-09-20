// At the top of test/index.test.js


// const test = require('firebase-functions-test')();
const { expect } = require('chai');
const assert = require('assert');
const myFunctions = require('../index.js');


it('Should be include in the parse response', (done) => {
  // define some data to compare against
  const suppose = 'Current conditions in the City\n      Paris, France';
  // call the function we're testing
  const result = myFunctions.callWeatherApi('Paris');

  // assertions
  result.then((data) => {
    expect(data).to.include(suppose);
    done();
  }).catch((logError) => {
    assert.fail(logError);
    done();
  });
});


it('Should be a string', (done) => {
  // define some data to compare against
  const host = 'api.worldweatheronline.com';
  expect(host).to.be.a('string');
  done();
});

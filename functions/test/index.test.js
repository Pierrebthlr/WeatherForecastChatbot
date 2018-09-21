// At the top of test/index.test.js


// const test = require('firebase-functions-test')();
const chai = require('chai');

const { expect } = chai;
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const myFunctions = require('../index.js');

describe('Unit Test for the Firebase functions', () => {
  it('Test the API call and the parse response of a good city', () => {
    // define the data to compare against. As the response depend of the date we can test only
    // the begining of the response
    const suppose = 'Current conditions in the City\n      Paris, France';
    // call the function we're testing
    const result = myFunctions.callWeatherApi('Paris');
    // Test if the result correspond to the expect message
    return expect(result).to.eventually.include(suppose);
  });
  it('Test the API call and the parse response of a wrong city', () => {
    // define the data to compare against.
    const suppose = 'Unable to find any matching weather location to the query submitted!';
    // call the function we're testing
    const result = myFunctions.callWeatherApi('');

    // Test if the result correspond to the expect message
    return expect(result).to.eventually.equal(suppose);
  });
});

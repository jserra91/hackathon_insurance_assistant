'use strict';

const dbController = require('../TWS/dbController');
const constants = require('../Utils/constants').getConstants();
const urlConstants = require('../Utils/urlConstants').getConstants();
const utils = require('../Utils/utils');
const cardUtils = require('../Utils/cardUtils');
const _attributesClass = require('../Classes/attributes');
const _responseClass = require('../Classes/response');
const _deviceResponseClass = require('../Classes/deviceResponse');

let _attributes = new _attributesClass();
let _deviceResponse = new _deviceResponseClass();
let _response = new _responseClass()

const FAQRequestFunction = async function (intentName) {
	try {

		var idToSearch;
		if (intentName === 'insultos') {
			idToSearch = 'insultOutput';
		} else if (intentName === 'saludos') {
			idToSearch = 'greetingsOutput';
		} else if (intentName == 'Gracias') {
			idToSearch = 'yourWelcomeOutput';
		}

		await dbController.getConstant(idToSearch)
			.then(result => {
				console.log('result in then dbController: ' + JSON.stringify(result, null, 4));
				if (result.Items.length > 0) {
					var constant = result.Items[0]
					var index1 = utils.getRandomIndexOfArray(constant.text.length);

					_deviceResponse.displayText = constant.text[index1];
					_deviceResponse.speechText = constant.text[index1];
					_deviceResponse.repromptText = constant.text[index1];

					_response.deviceResponse = _deviceResponse;
				} else {
					return Promise.reject(_response.errorMessage = constants.errorMessage);
				}
			})
			.catch(error => {
				console.log("error en FAQRequestFunction1 function " + error);
				return Promise.reject(_response.errorMessage = constants.errorMessage);
			});

		return Promise.resolve(_response);

	} catch (error) {
		console.log("error en FAQRequestFunction2 function " + error);
		return Promise.reject(_response.errorMessage = constants.errorMessage);
	}
}

module.exports.FAQRequestFunction = FAQRequestFunction;	
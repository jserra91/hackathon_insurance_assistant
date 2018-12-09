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
let _response = new _responseClass();

const FutureIntentFunction = async function () {
	try {
		await dbController.getConstant('futureOutput')
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
				console.log("error en FutureIntentFunction2 function " + error);
				return Promise.reject(_response.errorMessage = constants.errorMessage);
			});

		return Promise.resolve(_response);

	} catch (error) {
		console.log("error en FutureIntentFunction function " + error);
		return Promise.reject(_response.errorMessage = constants.errorMessage);
	}
}

const getFutureIntentDisplay = function (attributes) {

	const backgroundImage = cardUtils.imageMaker("", urlConstants.urlLaunchDisplayBackgroundImg);

	var richText = cardUtils.richTextMaker(constants.futureIntentsText);
	var template = {
		type: 'BodyTemplate1',
		token: 'default',
		backButton: 'hidden',
		backgroundImage,
		title: constants.welcomeModalTitle,
		textContent: richText
	};

	return template;
}




module.exports.FutureIntentFunction = FutureIntentFunction;
module.exports.getFutureIntentDisplay = getFutureIntentDisplay;

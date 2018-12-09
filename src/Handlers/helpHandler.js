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

const HelpRequestFunction = async function (intentName) {
	try {

		var idToSearch;
		if (intentName === 'HelpIntent') {
			idToSearch = 'helpOutput';
		} else if (intentName === 'ayudaEnfermedades') {
			idToSearch = 'helpSickness';
		} else if (intentName === 'ayudaTratamiento') {
			idToSearch = 'helpTreatment';
		} else if (intentName === 'ayudaPruebas') {
			idToSearch = 'helpMedicalTest';
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
				console.log("error en HelpRequestFunction1 function " + error);
				return Promise.reject(_response.errorMessage = constants.errorMessage);
			});

		return Promise.resolve(_response);

	} catch (error) {
		console.log("error en HelpRequestFunction2 function " + error);
		return Promise.reject(_response.errorMessage = constants.errorMessage);
	}
}

const getMainHelpDisplay = function () {
	var backgroundImage = cardUtils.imageMaker('', urlConstants.urlLaunchDisplayBackgroundImg);
	var title = constants.helpModalTitle;
	var itemList = [];

	itemList.push({
		"token": 'tokenMainHelpResquest1',
		"textContent": cardUtils.richTextMaker('<font size="3"><br/>Ayuda enfermedades</font>', null, null),
		"image": null
	});

	itemList.push({
		"token": 'tokenMainHelpResquest2',
		"textContent": cardUtils.richTextMaker('<font size="5"><br/>Ayuda pruebas</font>', null, null),
		"image": null
	});

	itemList.push({
		"token": 'tokenMainHelpResquest3',
		"textContent": cardUtils.richTextMaker('<font size="5"><br/>Ayuda tratamientos</font>', null, null),
		"image": null
	});


	itemList.push({
		"token": 'tokenMainHelpResquest4',
		"textContent": cardUtils.richTextMaker('<br/><font size="5">Volver</font>', null, null),
		"image": null
	});

	var listTemplate = {
		type: 'ListTemplate1',
		backButton: 'hidden',
		backgroundImage,
		title: title,
		listItems: itemList
	};

	return listTemplate;
}



module.exports.HelpRequestFunction = HelpRequestFunction;
module.exports.getMainHelpDisplay = getMainHelpDisplay;	
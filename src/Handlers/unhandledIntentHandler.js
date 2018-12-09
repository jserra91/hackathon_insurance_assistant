'use strict';

const dbController = require('../TWS/dbController');
const constants = require('../Utils/constants').getConstants();
const urlConstants = require('../Utils/urlConstants').getConstants();
const utils = require('../Utils/utils');
const cardUtils = require('../Utils/cardUtils');


const UnhandledRequestFunction=function(){
	try{
		return new Promise((resolve,reject)=>{
			try{
				dbController.getConstant("notUnderstandOutput", (err, result) => {
					try{
						if (err) {
							reject({response:constants.errorMessage});
						} else {
							if (result.Items.length > 0) {
								var constant = result.Items[0]
								var index1 = utils.getRandomIndexOfArray(constant.text.length);
								var speechOutput=constant.text[index1];
								var repromt=constant.reprompt;
								
								resolve({speechOutput:speechOutput,reprompt:repromt});

							}else{
								reject({response:constants.errorMessage});
							}
						}
					}catch(error){
						console.log("error en UnhandledRequestFunction function "+error);
						reject({response:constants.errorMessage});
					}
				});
			}catch(error){
				console.log("error en UnhandledRequestFunction function "+error);
				reject({response:constants.errorMessage});
			}
		
		});
	}catch(error){
		console.log("error en UnhandledRequestFunction function "+error);
	}
}



module.exports.UnhandledRequestFunction = UnhandledRequestFunction;	
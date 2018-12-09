'use strict';

const dbController = require('../TWS/dbController');
const imageChecker = require('../TWS/imageChecker');
const constants = require('../Utils/constants').getConstants();
const urlConstants = require('../Utils/urlConstants').getConstants();
const utils = require('../Utils/utils');
const cardUtils = require('../Utils/cardUtils');
const infoPrueba = require('../TWS/infoPrueba');


const maxBody = 7860;
const cutBody = 7855;
const maxModal = 7860;
const cutModal = 7855;

//Function used to read queEsDato when it is already in memory
const queEsDatoRequestFunction = async function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				dbController.getConstant("options", (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage });
						} else {

							if (result.Items.length > 0) {
								var constant = result.Items[0]
								var index1 = utils.getRandomIndexOfArray(constant.text.length);
								var response = attributes.bodyResponse.assistant + "<break time='" + attributes.pause + "'/>" + constant.text[index1];

								resolve({ speechOutput: response, reprompt: response });

							} else {
								reject({ response: constants.errorMessage });
							}
						}
					} catch (error) {
						console.log("error en queEsDatoRequestFunction function " + error);
						reject({ response: constants.errorMessage });
					}
				});
			} catch (error) {
				console.log("error en queEsDatoRequestFunction function " + error);
				reject({ response: constants.errorMessage });
			}

		});
	} catch (error) {
		console.log("error en queEsDatoRequestFunction function " + error);
	}
}

const getQueEsDisplay = function (attributes) {
	var backgroundImage = cardUtils.imageMaker('', urlConstants.urlLaunchDisplayBackgroundImg);

	if (attributes.pruebaNombre == 'Lupus') {
		backgroundImage = cardUtils.imageMaker('', 'https://r2d2fileserver.blob.core.windows.net/blob/lupus-800x450_osuro.jpg');
	}

	var title = attributes.pruebaNombre;
	var itemList = [];

	if (typeof attributes.bodyResponse != 'undefined') {

		//backgroundImage = cardUtils.imageMaker('',attributes.bodyResponse.MIME);
		itemList.push({
			"token": 'tokenMainQueEsRequest1',
			"textContent": cardUtils.richTextMaker('<br/><font size="5">Más información</font>', null, null),
			"image": null
		});
	}

	itemList.push({
		"token": 'tokenMainQueEsRequest2',
		"textContent": cardUtils.richTextMaker('<br/><font size="5">Proximamente</font>', null, null),
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

//Function used to answer when the search "dato" is not found
const queEsDatoNoFoundRequestFunction = function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				dbController.getConstant("noPruebaFound", (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage });
						} else {

							if (result.Items.length > 0) {
								var constant = result.Items[0]
								var index1 = utils.getRandomIndexOfArray(constant.text.length);
								var speechOutput = constant.text[index1];
								var repromt = constant.reprompt;

								resolve({ speechOutput: speechOutput, reprompt: repromt });

							} else {
								reject({ response: constants.errorMessage });
							}
						}
					} catch (error) {
						console.log("error en queEsDatoNoFoundRequestFunction3 function " + error);
						reject({ response: constants.errorMessage });
					}
				});
			} catch (error) {
				console.log("error en queEsDatoNoFoundRequestFunction2 function " + error);
				reject({ response: constants.errorMessage });
			}

		});
	} catch (error) {
		console.log("error en queEsDatoNoFoundRequestFunction function " + error);
	}
}

//Function used to answer when we have to search "dato" for queEsDato
const getDatoInfoFunction = async function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				// Petición al servicio para obtener la información de una prueba médica o enfermedad
				infoPrueba.getPruebaInfo(attributes.pruebaNombre, constants.typeWildCard, (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage });
						} else {
							if (result.length > 0) {
								console.log('result from API: ' + result);
								console.log('attributes from API: ' + attributes);
								// Guardamos el resultado en la variable global (memoria)
								attributes.bodyResponse = selectResponse(result);
								console.log('attributes from API: ' + attributes);
								// Obtener constante de respuesta de BD para dar las opciones de más información o otra consulta
								dbController.getConstant("options", (err, result) => {
									if (err) {
										console.log('Error from DB: ' + err);
										reject({ response: constants.errorMessage });
									} else {
										if (result.Items.length > 0) {
											console.log('result from DB: ' + result);
											// Respuesta random
											var constant = result.Items[0];
											var index1 = utils.getRandomIndexOfArray(constant.text.length);

											var response = attributes.bodyResponse.assistant + "<break time='" + attributes.pause + "'/>" + constant.text[index1];

											console.log('response from DB: ' + response);
											// Devolver respuesta con la información de la prueba o enfermedad, más la pregunta de si quiere algo más
											resolve({ speechOutput: response, reprompt: response, attributes: attributes });
										} else {
											resolve({ speechOutput: constants.errorMessage, reprompt: constants.errorMessage, attributes: attributes });
										}
									}
								});
							} else {
								console.log("No data for this 'dato'")
								// Si no hay resultados sobre esa prueba o enfermedad, devolvemos que no hay información para ese dato, pero estará próximamente
								attributes.bodyResponse.clear();

								dbController.getConstant("noInfo", (err, result) => {
									if (err) {
										reject({ response: constants.errorMessage });
									} else {
										if (result.Items.length > 0) {
											// Respuesta random
											var constant = result.Items[0]
											var index1 = utils.getRandomIndexOfArray(constant.text.length);

											// Devolver respuesta (no hay información todavía para esa prueba, pero la va a haber)											
											resolve({ speechOutput: constant.text[index1], reprompt: constant.text[index1], attributes: attributes });
										} else {
											resolve({ speechOutput: constants.errorMessage, reprompt: constants.errorMessage, attributes: attributes });
										}
									}
								});

							}
						}
					} catch (error) {
						console.log("error en getDatoInfoFunction function " + error);
						reject({ response: constants.errorMessage });
					}
				});
			} catch (error) {
				console.log("error en getDatoInfoFunction function " + error);
				reject({ response: constants.errorMessage });
			}

		});
	} catch (error) {
		console.log("error en getDatoInfoFunction function " + error);
	}
}

//Function used to answer when we have to search "dato" for queEsPruebaOTratamiento
const getPruebaOTratamientoInfoFunction = function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				// Petición al servicio para obtener la información de una prueba médica o enfermedad
				infoPrueba.getPruebaInfo(attributes.pruebaNombre, constants.typePrueba, (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage });
						} else {
							if (result.length > 0) {
								// Guardamos el resultado en la variable global (memoria)
								attributes.bodyResponse = result[0];

								// Obtener constante de respuesta de BD para dar las opciones de más información o otra consulta
								dbController.getConstant("options", (err, result) => {
									if (err) {
										reject({ response: constants.errorMessage });
									} else {
										if (result.Items.length > 0) {
											// Respuesta random
											var constant = result.Items[0]
											var index1 = utils.getRandomIndexOfArray(constant.text.length);

											var response = attributes.bodyResponse.assistant + "<break time='" + attributes.pause + "'/>" + constant.text[index1];

											// Devolver respuesta con la información de la prueba o enfermedad, más la pregunta de si quiere algo más
											resolve({ speechOutput: response, reprompt: response, attributes: attributes });
										} else {
											resolve({ speechOutput: constants.errorMessage, reprompt: constants.errorMessage, attributes: attributes });
										}
									}
								});
							} else {
								console.log("No data for this 'dato'")
								// Si no hay resultados sobre esa prueba o enfermedad, devolvemos que no hay información para ese dato, pero estará próximamente
								attributes.bodyResponse = undefined;

								dbController.getConstant("noInfo", (err, result) => {
									if (err) {
										reject({ response: constants.errorMessage });
									} else {
										if (result.Items.length > 0) {
											// Respuesta random
											var constant = result.Items[0]
											var index1 = utils.getRandomIndexOfArray(constant.text.length);

											// Devolver respuesta (no hay información todavía para esa prueba, pero la va a haber)											
											resolve({ speechOutput: constant.text[index1], reprompt: constant.text[index1], attributes: attributes });
										} else {
											resolve({ speechOutput: constants.errorMessage, reprompt: constants.errorMessage, attributes: attributes });
										}
									}
								});
							}

						}

					} catch (error) {
						console.log("error en getPruebaOTratamientoInfoFunction3 function " + error);
						reject({ response: constants.errorMessage });
					}
				});

			} catch (error) {
				console.log("error en getPruebaOTratamientoInfoFunction2 function " + error);
				reject({ response: constants.errorMessage });
			}

		});
	} catch (error) {
		console.log("error en getPruebaOTratamientoInfoFunction function " + error);
	}
}

//Functions used to answer when masInfoDato when we already have info in memory
const masInfoDatoRequestFunction = function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				var idToSearch;
				if (attributes.display) {
					idToSearch = 'masInfoDisplay';
				} else {
					idToSearch = 'masInfo';
				}

				// Obtener constante de respuesta de BD (con el String guardado dependiendo de si es enfermedad o prueba médica)
				dbController.getConstant(idToSearch, (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage });
						} else {
							if (result.Items.length > 0) {
								// Respuesta random
								var constant = result.Items[0]
								var index1 = utils.getRandomIndexOfArray(constant.text.length);
								var str = "";
								// Llamada a la función que construye el body de la card a partir del objeto guardado en memoria
								str = strCard(attributes);
								// Devolver respuesta con la card
								resolve({ speechOutput: constant.text[index1], repromt: constant.text[index1], cardTitle: attributes.pruebaCard, cardBody: str, attributes: attributes });
							} else {
								reject({ response: constants.errorMessage });
							}
						}
					} catch (error) {
						console.log("error en masInfoDatoRequestFunction function " + error);
						reject({ response: constants.errorMessage });
					}
				});
			} catch (error) {
				console.log("error en masInfoDatoRequestFunction function " + error);
				reject({ response: constants.errorMessage });
			}

		});
	} catch (error) {
		console.log("error en masInfoDatoRequestFunction function " + error);
	}
}

//Function used to answer  masInfoDato when we have to perform the search
const masInfoDatoSearchRequestFunction = function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				infoPrueba.getPruebaInfo(attributes.pruebaNombre, constants.typeWildCard, (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage, attributes: attributes });
						} else {
							var idToSearch;
							if (attributes.display) {
								idToSearch = 'masInfoDisplay';
							} else {
								idToSearch = 'masInfo';
							}

							if (result.length > 0) {
								// Guardamos el resultado en la variable global (memoria)
								attributes.bodyResponse = selectResponse(result);
								// Obtener constante de respuesta de BD (con el String guardado dependiendo de si es enfermedad o prueba médica)
								dbController.getConstant(idToSearch, (err, result) => {
									if (err) {
										reject({ response: constants.errorMessage, attributes: attributes });
									} else {
										if (result.Items.length > 0) {
											// Respuesta random
											var constant = result.Items[0]
											var index1 = utils.getRandomIndexOfArray(constant.text.length);
											var str = "";
											// Llamada a la función que construye el body de la card a partir del objeto guardado en memoria
											str = strCard(attributes);
											// Devolver respuesta con la card
											resolve({ speechOutput: constant.text[index1], repromt: constant.text[index1], cardTitle: attributes.pruebaCard, cardBody: str, attributes: attributes });
										} else {
											reject({ response: constants.errorMessage, attributes: attributes });
										}
									}
								});
							} else {
								console.log("No data for this 'dato'")
								// Si no hay resultados sobre esa prueba o enfermedad, devolvemos que no hay información para ese dato, pero estará próximamente
								attributes.bodyResponse = undefined;

								dbController.getConstant("noInfo", (err, result) => {
									try {
										if (err) {
											reject({ response: constants.errorMessage, attributes: attributes });
										} else {
											if (result.Items.length > 0) {
												// Respuesta random
												var constant = result.Items[0]
												var index1 = utils.getRandomIndexOfArray(constant.text.length);

												// Devolver respuesta (no hay información todavía para esa prueba, pero la va a haber)											
												resolve({ speechOutput: constant.text[index1], reprompt: constant.text[index1], attributes: attributes });
											} else {
												reject({ response: constants.errorMessage, attributes: attributes });
											}
										}
									} catch (error) {
										console.log("error en masInfoDatoSearchRequestFunction4 function " + error);
										reject({ response: constants.errorMessage, attributes: attributes });
									}
								});
							}

						}

					} catch (error) {
						console.log("error en masInfoDatoSearchRequestFunction3 function " + error);
						reject({ response: constants.errorMessage, attributes: attributes });
					}
				});
			} catch (error) {
				console.log("error en masInfoDatoSearchRequestFunction2 function " + error);
				reject({ response: constants.errorMessage, attributes: attributes });
			}

		});
	} catch (error) {
		console.log("error en masInfoDatoSearchRequestFunction function " + error);
	}
}


const masInfoTratamientoSearchRequestFunction = function (attributes) {
	try {
		return new Promise((resolve, reject) => {
			try {
				// Petición al servicio para obtener la información de una prueba médica o enfermedad
				infoPrueba.getPruebaInfo(_pruebaNombre, constants.typePrueba, (err, result) => {
					try {
						if (err) {
							reject({ response: constants.errorMessage, attributes: attributes });
						} else {
							if (result.length > 0) {
								var idToSearch;
								if (attributes.display) {
									idToSearch = 'masInfoDisplay';
								} else {
									idToSearch = 'masInfo';
								}

								// Guardamos el resultado en la variable global (memoria)
								attributes.bodyResponse = result[0];
								dbController.getConstant(idToSearch, (err, result) => {
									try {
										if (err) {
											reject({ response: constants.errorMessage, attributes: attributes });
										} else {
											if (result.Items.length > 0) {
												// Respuesta random
												var constant = result.Items[0];
												var index1 = utils.getRandomIndexOfArray(constant.text.length);
												var str = "";
												// Llamada a la función que construye el body de la card a partir del objeto guardado en memoria
												str = strCard(attribures);
												// Devolver respuesta con la card
												resolve({ speechOutput: constant.text[index1], reprompt: constant.text[index1], attributes: attributes });;
											} else {
												reject({ response: constants.errorMessage, attributes: attributes });
											}
										}

									} catch (error) {
										console.log("error en masInfoTratamientoSearchRequestFunction4 function " + error);
										reject({ response: constants.errorMessage, attributes: attributes });
									}
								});
							} else {
								console.log("No data for this 'dato'")
								// Si no hay resultados sobre esa prueba o enfermedad, devolvemos que no hay información para ese dato, pero estará próximamente
								attributes.bodyResponse = undefined;

								dbController.getConstant("noInfo", (err, result) => {
									try {
										if (err) {
											reject({ response: constants.errorMessage, attributes: attributes });
										} else {
											if (result.Items.length > 0) {
												// Respuesta random
												var constant = result.Items[0]
												var index1 = utils.getRandomIndexOfArray(constant.text.length);

												// Devolver respuesta (no hay información todavía para esa prueba, pero la va a haber)											
												resolve({ speechOutput: constant.text[index1], reprompt: constant.text[index1], attributes: attributes });
											} else {
												reject({ response: constants.errorMessage, attributes: attributes });
											}
										}
									} catch (error) {
										console.log("error en masInfoDatoSearchRequestFunction4 function " + error);
										reject({ response: constants.errorMessage, attributes: attributes });
									}
								});
							}
						}
					} catch (error) {
						console.log("error en masInfoTratamientoSearchRequestFunction3 function " + error);
						reject({ response: constants.errorMessage, attributes: attributes });
					}
				});
			} catch (error) {
				console.log("error en masInfoTratamientoSearchRequestFunction2 function " + error);
				reject({ response: constants.errorMessage, attributes: attributes });
			}
		});
	} catch (error) {
		console.log("error en masInfoTratamientoSearchRequestFunction function " + error);
	}
}

const getMasInfoDisplay = function (attributes) {

	var backgroundImage = cardUtils.imageMaker("", urlConstants.urlLaunchDisplayBackgroundImg);
	if (attributes.pruebaNombre == 'Lupus') {
		backgroundImage = cardUtils.imageMaker('', 'https://r2d2fileserver.blob.core.windows.net/blob/lupus-800x450_osuro.jpg');
	}
	const myImage1 = cardUtils.imageMaker("", attributes.bodyResponse.MIME);

	// HAY QUE CAMBIAR EL TEXTO POR EL VALOR CORRESPONDIENTE CUANDO LO HAYA
	var richText = cardUtils.richTextMaker('<font size="5">Más información: ' + attributes.pruebaNombre + '</font><br/><br/>', '<font size="3">' + attributes.bodyResponse.assistant + '</font>');
	var template = {
		type: 'BodyTemplate2',
		token: 'default',
		backButton: 'hidden',
		backgroundImage,
		image: myImage1,
		title: null, //constants.masinfoTitle,
		textContent: richText
	};

	return template;
}


const getErrorDisplay = function (attributes) {

	const backgroundImage = cardUtils.imageMaker("", urlConstants.urlLaunchDisplayBackgroundImg);
	var richText = cardUtils.richTextMaker(constants.errorIntentsText);
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

const getDefaultDisplay = function (attributes) {
	/*
	const backgroundImage = cardUtils.imageMaker("", urlConstants.urlLaunchDisplayBackgroundImg);

	var template={
				  type: 'BodyTemplate1',
				  token: 'default',
				  backButton: 'hidden',
				  backgroundImage,
				  title: constants.welcomeModalTitle,
				  textContent: null
	};
	
	return template;*/


	const backgroundImage = cardUtils.imageMaker("", urlConstants.urlLaunchDisplayBackgroundImg);

	var title = constants.welcomeModalTitle;

	var auxiliary = ["Prueba a decir: \"¿Qué es la Gastroenteritis?\"",
		"Prueba a decir: \"¿Qué es una cesárea?\"",
		"Prueba a preguntar: \"¿Qué es la Enfermedad de Crohn?\"",
		"Prueba a preguntar: \"¿Qué es la Diabetes?\"",
		"Prueba a preguntar: \"¿Qué es la Rizólisis?\"",
		"Prueba a decir: \"¿Qué es una Ecografía 4D?\""];

	if (typeof attributes.templateBody != 'undefined' && attributes.templateBody.length > 0) {
		auxiliary = attributes.templateBody;
	}


	var index1 = utils.getRandomIndexOfArray(auxiliary.length);

	var richText = cardUtils.richTextMaker('<font size="5">' + auxiliary[index1] + '</font>');


	var template = {
		type: 'BodyTemplate1',
		token: 'default',
		backButton: 'hidden',
		backgroundImage,
		title: title, //constants.masinfoTitle,
		textContent: richText
	};

	return template;
}







// Construir cuerpo de la card, diferenciando prueba médica de enfermedad
/* Cuando el servicio cambie y en vez de llegar tantos campos llegue el body de la card,
hay que cambiar los replace y poner únicamente strAux = _bodyResponse.(body de la card)
Puede que no haga falta diferenciar entre prueba médica o enfermedad.
*/
function strCard(attributes) {
	console.log("Building card body")
	var strAux = "";
	// Construcción body card
	strAux = attributes.bodyResponse.body;

	if (strAux.length > 7899) {
		strAux = strAux.substring(0, 7895);
		strAux = strAux + "...";
	}

	console.log("strAux " + strAux);

	return strAux;
}

function selectResponse(result) {
	var response;

	for (var i = 0; i < result.length; i++) {
		if (result[i].Type == constants.typeEnfermedad) {
			response = result[i];
			break;
		}
	}

	if (typeof response == 'undefined') {
		response = result[0];
	}


	return response;
}

module.exports.queEsDatoRequestFunction = queEsDatoRequestFunction;
module.exports.queEsDatoNoFoundRequestFunction = queEsDatoNoFoundRequestFunction;
module.exports.getDatoInfoFunction = getDatoInfoFunction;
module.exports.getPruebaOTratamientoInfoFunction = getPruebaOTratamientoInfoFunction;
module.exports.masInfoDatoRequestFunction = masInfoDatoRequestFunction;
module.exports.masInfoDatoSearchRequestFunction = masInfoDatoSearchRequestFunction;
module.exports.masInfoTratamientoSearchRequestFunction = masInfoTratamientoSearchRequestFunction;
module.exports.getQueEsDisplay = getQueEsDisplay;
module.exports.getMasInfoDisplay = getMasInfoDisplay;
module.exports.getErrorDisplay = getErrorDisplay;
module.exports.getDefaultDisplay = getDefaultDisplay;

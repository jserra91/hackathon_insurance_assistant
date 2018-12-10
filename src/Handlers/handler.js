"use strict";

const launchHandler = require("./launchHandler");
const helpHandler = require("./helpHandler");
const cancelHandler = require("./cancelHandler");
const stopHandler = require("./stopHandler");
const unhandledIntentHandler = require("./unhandledIntentHandler");
const genericIntentHandler = require("./genericIntentHandler");
const futureIntentsHandler = require("./futureIntentsHandler");
const mainIntentsHandler = require("./mainIntentsHandler");
const constants = require("../Utils/constants").getConstants();
const _attributesClass = require("../Classes/attributes");
const _deviceResponseClass = require("../Classes/deviceResponse");
const { Payload, Text } = require("dialogflow-fulfillment");
const { dialogflow, SimpleResponse, BasicCard, Button, Image} = require("actions-on-google");
const dbController = require("../TWS/dbController");

let _app = dialogflow();
let _attributes = new _attributesClass();
let _deviceResponse = new _deviceResponseClass();
let _display = false;

const handlerWelcomeFunction = async function(agent) {
  let conv = agent.conv();

  try {
    console.log("Intent: LaunchRequest INIT");
    conv.ask(
      new SimpleResponse({
        speech: "Bienvenido a SaludBot, tu Gestor de prestaciones médicas. ¿Podrías indicarnos tu DNI para consultar tu catálogo de prestaciones disponibles?",
        text: "Bienvenido a SaludBot, tu Gestor de prestaciones médicas. ¿Podrías indicarnos tu DNI para consultar tu catálogo de prestaciones disponibles?"
      })
    );
	
	// Create a basic card
	conv.ask(new BasicCard({
	  text: `This is a basic card.  Text in a basic card can include "quotes" and
	  most other unicode characters including emoji 📱.  Basic cards also support
	  some markdown formatting like *emphasis* or _italics_, **strong** or
	  __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other
	  things like line  \nbreaks`, // Note the two spaces before '\n' required for
								   // a line break to be rendered in the card.
	  subtitle: 'This is a subtitle',
	  title: 'Title: this is a title',
	  buttons: new Button({
		title: 'This is a button',
		url: 'https://wwww.marca.com/',
	  }),
	  image: new Image({
		url: 'https://www.digital-salud.com/wp-content/uploads/2018/10/alexa3.jpg',
		alt: 'Image alternate text',
	  }),
	  display: 'CROPPED',
	}));

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------handlerWelcomeFunction try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const handlerGoodbyeFunction = async function(agent) {
  let conv = agent.conv();

  try {
    console.log("Intent: handlerGoodbyeFunction INIT");
    conv.close(
      new SimpleResponse({
        speech: "Gracias por utilizar Salud Bot.",
        text: "Gracias por utilizar Salud Bot."
      })
    );

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------handlerGoodbyeFunction try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const provideDNI = async function(agent) {
  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
  let conv = agent.conv();

  try {
    console.log("INIT :: provideDNI;");

    //Validar DNI
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    var dni = conv.body.queryResult.parameters.dni;
	dni=dni.replace(' ','');
	
    console.log("provideDNI :: dni -> " + dni);
	
    let validado = false;
    // DNI de 9 digitos? Validar si es undefined o no
    if (!!dni && dni.length === 9) {
      // calcular letra a partir de los numeros
      const letra = letras.charAt(dni.substring(0, 8) % 23);
      // letra calculada === letra DNI
      if (letra === dni.substring(8, 9)) {
        validado = true;
      }
    }

	var resultados;
    if (validado) {
      validado = false;
      console.log("INIT :: requestDNI valido :: dni -> " + dni);
      await dbController
        .getDni(dni)
        .then(result => {
          console.log(
            "result in then dbController: " + JSON.stringify(result, null, 4)
          );
          if (result.Items.length > 0) {
            console.log("INIT :: requestDNI valido :: dni -> es valido");
            validado = true;
            resultados = result;
          } else {
            console.log("INIT :: requestDNI valido :: dni -> no es valido");
            validado = false;
            resultados = [];
          }
        })
        .catch(error => {
          console.log("error en StopRequestFunction2 function " + error);
          return Promise.reject(
            (_response.errorMessage = constants.errorMessage)
          );
        });
    }

    if (validado) {
      console.log("INIT :: requestDNI FINAL :: dni -> es valido");
      // Guardar en la session el DNI
      _attributes.dni = dni;
      // Preguntar que desea
      conv.ask(
        new SimpleResponse({
          speech:
            "Que desea autorizar? una endoscopia, analisis de sangre o una operación",
          text:
            "Que desea autorizar? una endoscopia, analisis de sangre o una operación"
        })
      );
	  
	  
	agent.setContext({
		'name': 'attributes',
		'lifespan': 99,
		'parameters': {
			'attributes': {
				'resultados':resultados
			}
		}
	});

  } else {
      console.log("INIT :: requestDNI FINAL :: dni -> no es valido");
      // DNI Invalido
      conv.ask(
        new SimpleResponse({
          speech: "El Numero de documento es invalido",
          text: "El Numero de documento es invalido"
        })
      );
	  
		agent.setContext({
			'name': 'provide_dni-followup',
			'lifespan': -1,
			'parameters': {}
		});
    }

    // serializar
    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------LaunchRequest try error----------" + error);
    agent.add(constants.errorMessage);
  }
};


const indicarPrueba = async function(agent) {
  console.log("Intent: indicarPrueba INIT");
  let conv = agent.conv();

  var prueba = conv.body.queryResult.parameters.Prueba_medica;
  console.log("Intent: indicarPrueba "+prueba);
  let attributesContext=undefined;
  
  if (agent.contexts != undefined) {
	attributesContext = agent.getContext('attributes');
  }
 
  console.log("mis atributos %j",attributesContext);
  var nivel=undefined;
  var found=false;
  
  for(var i = 0; i < attributesContext.parameters.attributes.resultados.Items[0].simple.length;i++){
	if (attributesContext.parameters.attributes.resultados.Items[0].simple[i] == prueba){
		nivel = '01 - Autorizado';
		found=true;
		break;
	}
  }
  
  if(found==false){
	  for(var i = 0; i < attributesContext.parameters.attributes.resultados.Items[0].media.length;i++){
		if (attributesContext.parameters.attributes.resultados.Items[0].media[i] == prueba){
			nivel = '02 - Simple';
			found=true;
			break;
		}
	  }
  }
  
  if(found==false){
	  nivel = '03 - Compleja'
  }
  
  try {

	if (nivel== '01 - Autorizado'){

		 conv.ask(
		  new SimpleResponse({
			speech: "No es necesario autorizar esta prestación, pertenece al catálogo de servicios básicos. ¿Qué más necesitas?.",
			text: "No es necesario autorizar esta prestación, pertenece al catálogo de servicios básicos. ¿Qué más necesitas?."
		  })
		);
		agent.setContext({
				'name': 'provide_dni-followup',
				'lifespan': -1,
				'parameters': {}
			});		
		agent.setContext({
			'name': 'provide_dni-indicarprueba-followup',
			'lifespan': -1,
			'parameters': {}
		});
	}else if (nivel== '02 - Simple'){
		 conv.ask(
		  new SimpleResponse({
			speech: "Podrías indicarme el número del volante",
			text: "Podrías indicarme el número del volante"
		  })
		);
    }else {		
		var tramiteId=undefined;
		
		 await dbController
			.inserTramite(prueba, attributesContext)
			.then(result => {
			  console.log(
				"result in then dbController: " + JSON.stringify(result, null, 4)
			  );
			  tramiteId=result.id;
			  
			})
			.catch(error => {
			  console.log("error en StopRequestFunction2 function " + error);
			  return Promise.reject(
				(_response.errorMessage = constants.errorMessage)
			  );
			});
	
		
		conv.ask(
			new SimpleResponse({
			speech: "tu tratmite se ha abierto con el id "+tramiteId,
			text: "tu tratmite se ha abierto con el id "+tramiteId
		})
		);
		
		agent.setContext({
				'name': 'provide_dni-followup',
				'lifespan': -1,
				'parameters': {}
			});		
		agent.setContext({
			'name': 'provide_dni-indicarprueba-followup',
			'lifespan': -1,
			'parameters': {}
		});
    }	
		

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------indicarPrueba try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const indicarVolante = async function(agent) {
 console.log("Intent: indicarVolante INIT");
  let conv = agent.conv();

  var volante = conv.body.queryResult.parameters.number;
  console.log("Intent: indicarVolante "+volante);
  let attributesContext=undefined;

  if (agent.contexts != undefined) {
	attributesContext = agent.getContext('attributes');
  }
  try {
		var autorizacionid=undefined;
		
		 await dbController
			.insertAutorizacion(volante, attributesContext)
			.then(result => {
			  console.log(
				"result in then dbController: " + JSON.stringify(result, null, 4)
			  );
			  autorizacionid=result.id;
			  
			})
			.catch(error => {
			  console.log("error en StopRequestFunction2 function " + error);
			  return Promise.reject(
				(_response.errorMessage = constants.errorMessage)
			  );
			});
	
		
		conv.ask(
			new SimpleResponse({
			speech: "tu autorización se ha abierto con el id "+autorizacionid,
			text: "tu autorización se ha abierto con el id "+autorizacionid
		})
		);
		
		agent.setContext({
				'name': 'provide_dni-followup',
				'lifespan': -1,
				'parameters': {}
			});		
		agent.setContext({
			'name': 'provide_dni-indicarprueba-followup',
			'lifespan': -1,
			'parameters': {}
		});
    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------indicarVolante try error----------" + error);
    agent.add(constants.errorMessage);
  }
};


const RequestVolante = async function(agent) {
  let conv = agent.conv();
  try {
    console.log("Intent: RequestVolante INIT");
    console.log(
      "Intent: RequestVolante INIT: " +
        JSON.stringify(_attributes.resultados, null, 4)
    );

    const volante = conv.body.queryResult.parameters.volante;
    console.log("Intent: RequestVolante INIT :: volante :: " + volante);

    // Generar random un numero de 0 a 9 -> Numero de volante
    const numero = Math.random() * (10000000 - 100000000) + 10000000;

    // Dni
    const dni = _attributes.dni;

    // Guardamos a la Base de datos. Un Update.
    await dbController.insertVolante(volante, numero, dni);

    conv.ask(
      new SimpleResponse({
        speech:
          "La prestación ha sido autorizada, tome nota del número de autorización para notificarlo en el centro médico. Es el numero " +
          numero +
          ". Le enviaremos el documento de autorización por correo electrónico. ¿Necesita algo más?.",
        text:
          "La prestación ha sido autorizada, tome nota del número de autorización para notificarlo en el centro médico. Es el numero " +
          numero +
          ". Le enviaremos el documento de autorización por correo electrónico. ¿Necesita algo más?."
      })
    );
    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
  } catch (error) {
    console.log("---------RequestVolante try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const helpFunction = async function(agent) {
  //Init session attributes
  console.log("handlerHelpFunction INIT");

  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

  let errorOccured = false;
  let conv = agent.conv();
  var intentName = agent.intent;

  // If the context exists
  if (agent.contexts != undefined) {
    let attributesContext = agent.getContext("attributes");
    console.log(
      "We have attributes from context: " +
        JSON.stringify(attributesContext, null, 4)
    );
    // If the context is undefined
    if (attributesContext != undefined) {
      if (attributesContext != undefined) {
        console.log(
          "We have attributes parameters: " +
            JSON.stringify(attributesContext.parameters.attributes, null, 4)
        );
        _attributes.init(attributesContext.parameters.attributes);
      }
    }
  }

  try {
    console.log("Intent: HelpIntentHandler");

    await helpHandler
      .HelpRequestFunction(intentName)
      .then(response => {
        console.log("We have a response");

        _deviceResponse = response.deviceResponse;

        console.log(
          "_attributes: " + JSON.stringify(_attributes.toJSON(), null, 4)
        );
        console.log(
          "_deviceResponse: " +
            JSON.stringify(_deviceResponse.toJSON(), null, 4)
        );
      })
      .catch(err => {
        console.log("err " + err);
        errorOccured = true;
        _deviceResponse.displayText = constants.errorMessage;
        _deviceResponse.speechText = constants.errorMessage;
        _deviceResponse.repromptText = constants.errorMessage;
      });

    agent.setContext({
      name: "attributes",
      lifespan: 5,
      parameters: {
        attributes: _attributes.toJSON()
      }
    });

    if (_display) {
      console.log("We have a display");
      if (errorOccured) {
        // var template=mainIntentsHandler.getErrorDisplay(attributes);
        // TODO Screens.
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      } else {
        var template;

        if (intentName === "HelpIntent") {
          // template=helpHandler.getMainHelpDisplay();
          conv.ask(
            new SimpleResponse({
              speech: _deviceResponse.speechText,
              text: _deviceResponse.displayText
            })
          );
        } else if (intentName === "ayudaEnfermedades") {
          // template=helpHandler.getMainHelpDisplay();
          conv.ask(
            new SimpleResponse({
              speech: _deviceResponse.speechText,
              text: _deviceResponse.displayText
            })
          );
        } else if (intentName === "ayudaTratamiento") {
          // template=helpHandler.getMainHelpDisplay();
          conv.ask(
            new SimpleResponse({
              speech: _deviceResponse.speechText,
              text: _deviceResponse.displayText
            })
          );
        } else if (intentName === "ayudaPruebas") {
          // template=helpHandler.getMainHelpDisplay();
          conv.ask(
            new SimpleResponse({
              speech: _deviceResponse.speechText,
              text: _deviceResponse.displayText
            })
          );
        }
      }
    } else {
      console.log("We do not have a display");
      conv.ask(
        new SimpleResponse({
          speech: _deviceResponse.speechText,
          text: _deviceResponse.displayText
        })
      );
    }

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
    console.log("Intent: HelpIntentHandler END");
  } catch (error) {
    console.log("---------HelpIntentHandler try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const genericHandlerFunction = async function(agent) {
  //Init session attributes
  console.log("genericHandlerFunction INIT");

  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

  let errorOccured = false;
  let conv = agent.conv();
  var intentName = agent.intent;

  // If the context exists
  if (agent.contexts != undefined) {
    let attributesContext = agent.getContext("attributes");
    console.log(
      "We have attributes from context: " +
        JSON.stringify(attributesContext, null, 4)
    );
    // If the context is undefined
    if (attributesContext != undefined) {
      if (attributesContext != undefined) {
        console.log(
          "We have attributes parameters: " +
            JSON.stringify(attributesContext.parameters.attributes, null, 4)
        );
        _attributes.init(attributesContext.parameters.attributes);
      }
    }
  }

  try {
    await genericIntentHandler
      .FAQRequestFunction(intentName)
      .then(response => {
        console.log("We have a response");

        _deviceResponse = response.deviceResponse;

        console.log(
          "_attributes: " + JSON.stringify(_attributes.toJSON(), null, 4)
        );
        console.log(
          "_deviceResponse: " +
            JSON.stringify(_deviceResponse.toJSON(), null, 4)
        );
      })
      .catch(err => {
        console.log("err " + err);
        errorOccured = true;
        _deviceResponse.displayText = constants.errorMessage;
        _deviceResponse.speechText = constants.errorMessage;
        _deviceResponse.repromptText = constants.errorMessage;
      });

    agent.setContext({
      name: "attributes",
      lifespan: 5,
      parameters: {
        attributes: _attributes.toJSON()
      }
    });

    if (_display) {
      console.log("We have a display");
      if (errorOccured) {
        // var var template=mainIntentsHandler.getErrorDisplay(attributes);
        // TODO Screens.
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      } else {
        // template=mainIntentsHandler.getDefaultDisplay(attributes);
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      }
    } else {
      console.log("We do not have a display");
      conv.ask(
        new SimpleResponse({
          speech: _deviceResponse.speechText,
          text: _deviceResponse.displayText
        })
      );
    }

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
    console.log("Intent: GenericHandler END");
  } catch (error) {
    console.log("---------GenericHandler try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const handlerQueEsDatoFunction = async function(agent, request, response) {
  //Init session attributes
  console.log("handlerQueEsDatoFunction INIT");
  console.log("!!!!   REQUEST   =>       " + JSON.stringify(request));
  console.log("!!!!   RESPONSE  =>       " + JSON.stringify(response));

  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

  let errorOccured = false;
  let conv = agent.conv();
  let entityValue = "";
  var intentName = agent.intent;
  console.log("intentName: " + intentName);

  // If the context exists
  if (agent.contexts != undefined) {
    let attributesContext = agent.getContext("attributes");
    console.log(
      "We have attributes from context: " +
        JSON.stringify(attributesContext, null, 4)
    );
    // If the context is undefined
    if (attributesContext.parameters.attributes != undefined) {
      console.log(
        "We have attributes parameters: " +
          JSON.stringify(attributesContext.parameters.attributes, null, 4)
      );
      _attributes.init(attributesContext.parameters.attributes);
    }

    if (attributesContext.parameters.datoConsultado != undefined) {
      console.log(
        "We have datoConsultado parameters: " +
          JSON.stringify(attributesContext.parameters.datoConsultado, null, 4)
      );
      entityValue = attributesContext.parameters.datoConsultado;
    }
  }

  console.log(
    "We have attributes ready: " + JSON.stringify(_attributes, null, 4)
  );

  try {
    if (intentName === "queEsDato") {
      console.log("queEsDato INIT If");
      if (_attributes.bodyResponse.MIME != "" && entityValue == "") {
        console.log("Read Memory data: %j", _attributes.bodyResponse);

        // > FER: cambio attributes => _attributes
        await mainIntentsHandler
          .queEsDatoRequestFunction(_attributes)
          .then(response => {
            console.log("We have a response");
            _deviceResponse.displayText = response.speechOutput;
            _deviceResponse.speechText = response.speechOutput;
            _deviceResponse.repromptText = response.speechOutput;
          })
          .catch(err => {
            console.log("err " + err);
            errorOccured = true;
            _deviceResponse.displayText = constants.errorMessage;
            _deviceResponse.speechText = constants.errorMessage;
            _deviceResponse.repromptText = constants.errorMessage;
          });

        agent.setContext({
          name: "attributes",
          lifespan: 5,
          parameters: {
            attributes: _attributes.toJSON()
          }
        });

        if (_display) {
          console.log("We have a display");
          if (errorOccured) {
            // var template = mainIntentsHandler.getErrorDisplay(attributes);
            // TODO Screens.
            conv.ask(
              new SimpleResponse({
                speech: _deviceResponse.speechText,
                text: _deviceResponse.displayText
              })
            );
          } else {
            conv.ask(
              new SimpleResponse({
                speech: _deviceResponse.speechText,
                text: _deviceResponse.displayText
              })
            );
          }
        } else {
          console.log("We do not have a display");
          conv.ask(
            new SimpleResponse({
              speech: _deviceResponse.speechText,
              text: _deviceResponse.displayText
            })
          );
        }

        let data = conv.serialize();
        console.log("data: %j", data);
        agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
      } else {
        console.log("queEsDato INIT Else");
        _attributes.bodyResponse.clear();
        if (entityValue == "") {
          console.log("Empty slot");
          // missing slot datoConsultado return an ask.
          conv.ask(
            new SimpleResponse({
              speech:
                "¿Sobre qué enfermedad, prueba médica o tratamiento quieres hacer la consulta?",
              text:
                "¿Sobre qué enfermedad, prueba médica o tratamiento quieres hacer la consulta?"
            })
          );

          let data = conv.serialize();
          console.log("data: %j", data);
          agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
        } else {
          // Obtener el nombre del slot que se ha preguntado
          // No se ha identificado una prueba médica o enfermedad válida
          if (false) {
            console.log("Not Valid Slot");
            // var speechOutput = undefined;
            // var reprompt = undefined;
            // var errorOccured = false;

            // await mainIntentsHandler.queEsDatoNoFoundRequestFunction(attributes)
            //     .then((response) => {
            //         speechOutput = response.speechOutput;
            //         reprompt = response.reprompt;
            //     })
            //     .catch((err) => {
            //         errorOccured = true;
            //         speechOutput = constants.errorMessage;
            //         reprompt = constants.errorMessage;
            //     });

            // handlerInput.attributesManager.setSessionAttributes(attributes);

            // if (_display) {
            //     if (errorOccured) {
            //         // var template = mainIntentsHandler.getErrorDisplay(attributes);
            //         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
            //     }
            //     else {
            //         var template = mainIntentsHandler.getQueEsDisplay(attributes);
            //         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
            //     }
            // } else {
            //     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
            // }
          } else {
            console.log("Valid Slot");
            // Tenemos el dato. Queremos comprobar si su ID es alfanumérico.
            // Si es alfanumérico, llamamos al servicio con el value.
            // if (utils.containsNumber(request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id) == true) {
            //     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            //     // Si no lo es significa que lo hemos especificado nosotros en Developer Alexa, así que llamamos al servicio con el ID
            // } else {
            //     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            // }

            _attributes.pruebaNombre = entityValue;
            // Guardamos el value del Slot para luego ponerlo en el título de la CARD, ya que aquí está escrito con mayúsculas
            _attributes.pruebaCard = entityValue.toUpperCase();

            await mainIntentsHandler
              .getDatoInfoFunction(_attributes)
              .then(response => {
                console.log("We have a response");
                _deviceResponse.displayText = response.speechOutput;
                _deviceResponse.speechText = response.speechOutput;
                _deviceResponse.repromptText = response.speechOutput;
                _attributes = response.attributes;
              })
              .catch(err => {
                console.log("err " + err);
                errorOccured = true;
                _deviceResponse.displayText = constants.errorMessage;
                _deviceResponse.speechText = constants.errorMessage;
                _deviceResponse.repromptText = constants.errorMessage;
              });

            agent.setContext({
              name: "attributes",
              lifespan: 5,
              parameters: {
                attributes: _attributes.toJSON()
              }
            });

            if (_display) {
              console.log("We have a display");
              if (errorOccured) {
                // var template = mainIntentsHandler.getErrorDisplay(attributes);
                // TODO Screens.
                conv.ask(
                  new SimpleResponse({
                    speech: _deviceResponse.speechText,
                    text: _deviceResponse.displayText
                  })
                );
              } else {
                // var template = mainIntentsHandler.getQueEsDisplay(attributes);
                // TODO Screens.
                conv.ask(
                  new SimpleResponse({
                    speech: _deviceResponse.speechText,
                    text: _deviceResponse.displayText
                  })
                );
              }
            } else {
              console.log("We do not have a display");
              conv.ask(
                new SimpleResponse({
                  speech: _deviceResponse.speechText,
                  text: _deviceResponse.displayText
                })
              );
            }

            let data = conv.serialize();
            console.log("data: %j", data);
            agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
          }
        }
      }
    }
    // } else if (intentName === 'queEsTratamiento') {
    //     if (typeof attributes.bodyResponse != 'undefined' && typeof request.intent.slots.dato.value == 'undefined') {
    //         var speechOutput = undefined;
    //         var reprompt = undefined;
    //         var errorOccured = false;

    //         await mainIntentsHandler.getPruebaOTratamientoInfoFunction(attributes)
    //             .then((response) => {
    //                 speechOutput = response.speechOutput;
    //                 reprompt = response.reprompt;
    //                 attributes = response.attributes;
    //             })
    //             .catch((err) => {
    //                 errorOccured = true;
    //                 speechOutput = constants.errorMessage;
    //                 reprompt = constants.errorMessage;
    //             });

    //         handlerInput.attributesManager.setSessionAttributes(attributes);

    //         if (attributes.display) {
    //             if (errorOccured) {
    //                 var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //             else {
    //                 var template = mainIntentsHandler.getQueEsDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //         } else {
    //             return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
    //         }

    //     } else {
    //         attributes.bodyResponse = undefined;
    //         if (typeof request.intent.slots.dato.value == 'undefined') {
    //             return handlerInput.responseBuilder.addDelegateDirective(intent).getResponse();
    //         } else {
    //             // Obtener el nombre del slot que se ha preguntado
    //             let pruebaSlot = resolveCanonical(request.intent.slots.dato);

    //             // No se ha identificado una prueba médica o enfermedad válida
    //             if (typeof request.intent.slots.dato.resolutions == 'undefined' || typeof request.intent.slots.dato.resolutions.resolutionsPerAuthority[0] == 'undefined' || request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH') {
    //                 var speechOutput = undefined;
    //                 var reprompt = undefined;
    //                 var errorOccured = false;

    //                 await mainIntentsHandler.queEsDatoNoFoundRequestFunction(attributes)
    //                     .then((response) => {
    //                         speechOutput = response.speechOutput;
    //                         reprompt = response.reprompt;
    //                     })
    //                     .catch((err) => {
    //                         errorOccured = true;
    //                         speechOutput = constants.errorMessage;
    //                         reprompt = constants.errorMessage;
    //                     });

    //                 handlerInput.attributesManager.setSessionAttributes(attributes);

    //                 if (attributes.display) {
    //                     if (errorOccured) {
    //                         var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                     else {
    //                         var template = mainIntentsHandler.getQueEsDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                 } else {
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
    //                 }
    //             } else {
    //                 console.log("Valid Slot")
    //                 // Tenemos el dato. Queremos comprobar si su ID es alfanumérico.
    //                 // Si es alfanumérico, llamamos al servicio con el value.
    //                 if (utils.containsNumber(request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id) == true) {
    //                     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //                     // Si no lo es significa que lo hemos especificado nosotros en Developer Alexa, así que llamamos al servicio con el ID
    //                 } else {
    //                     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    //                 }

    //                 // Guardamos el value del Slot para luego ponerlo en el título de la CARD, ya que aquí está escrito con mayúsculas
    //                 attributes.pruebaCard = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;

    //                 var speechOutput = undefined;
    //                 var reprompt = undefined;
    //                 var errorOccured = false;

    //                 await mainIntentsHandler.getPruebaOTratamientoInfoFunction(attributes)
    //                     .then((response) => {
    //                         speechOutput = response.speechOutput;
    //                         reprompt = response.reprompt;
    //                         attributes = response.attributes;
    //                     })
    //                     .catch((err) => {
    //                         errorOccured = true;
    //                         speechOutput = constants.errorMessage;
    //                         reprompt = constants.errorMessage;
    //                     });

    //                 handlerInput.attributesManager.setSessionAttributes(attributes);

    //                 if (attributes.display) {
    //                     if (errorOccured) {
    //                         var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                     else {
    //                         var template = mainIntentsHandler.getQueEsDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                 } else {
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
    //                 }

    //             }

    //         }
    //     }
    // } else if (intentName === 'masInfoDato') {
    //     if (typeof attributes.bodyResponse != 'undefined' && typeof request.intent.slots.dato.value == 'undefined') {
    //         console.log("Data in memory and no new slot");
    //         var speechOutput = undefined;
    //         var reprompt = undefined;
    //         var cardTitle = undefined;
    //         var cardBody = undefined;
    //         var errorOccured = false;

    //         await mainIntentsHandler.masInfoDatoRequestFunction(attributes)
    //             .then((response) => {
    //                 speechOutput = response.speechOutput;
    //                 reprompt = response.reprompt;
    //                 cardTitle = response.cardTitle;
    //                 cardBody = response.cardBody;
    //             })
    //             .catch((err) => {
    //                 errorOccured = true;
    //                 speechOutput = constants.errorMessage;
    //                 reprompt = constants.errorMessage;
    //             });

    //         handlerInput.attributesManager.setSessionAttributes(attributes);

    //         if (attributes.display) {
    //             if (errorOccured) {
    //                 var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //             else {
    //                 var template = mainIntentsHandler.getMasInfoDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //         } else {
    //             return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).withSimpleCard(cardTitle, cardBody).getResponse();
    //         }
    //     } else {
    //         //como ha especificado un valor de consulta nuevo o no hay limpiamos
    //         attributes.bodyResponse = undefined;
    //         if (typeof request.intent.slots.dato.value == 'undefined') {
    //             return handlerInput.responseBuilder.addDelegateDirective(intent).getResponse();
    //         } else {
    //             // Obtener el nombre del slot que se ha preguntado
    //             let pruebaSlot = resolveCanonical(request.intent.slots.dato);

    //             if (typeof request.intent.slots.dato.resolutions == 'undefined' || typeof request.intent.slots.dato.resolutions.resolutionsPerAuthority[0] == 'undefined' || request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH') {
    //                 var speechOutput = undefined;
    //                 var reprompt = undefined;
    //                 var errorOccured = false;

    //                 await mainIntentsHandler.queEsDatoNoFoundRequestFunction(attributes)
    //                     .then((response) => {
    //                         speechOutput = response.speechOutput;
    //                         reprompt = response.reprompt;
    //                     })
    //                     .catch((err) => {
    //                         errorOccured = true;
    //                         speechOutput = constants.errorMessage;
    //                         reprompt = constants.errorMessage;
    //                     });

    //                 handlerInput.attributesManager.setSessionAttributes(attributes);

    //                 if (attributes.display) {
    //                     if (errorOccured) {
    //                         var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                     else {
    //                         var template = mainIntentsHandler.getMasInfoDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                 } else {
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
    //                 }
    //             } else {
    //                 // Tenemos el dato. Queremos comprobar si su ID es alfanumérico.
    //                 // Si es alfanumérico, llamamos al servicio con el value.
    //                 if (utils.containsNumber(request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id) == true) {
    //                     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //                     // Si no lo es significa que lo hemos especificado nosotros en Developer Alexa, así que llamamos al servicio con el ID
    //                 } else {
    //                     attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    //                 }

    //                 // Guardamos el value del Slot para luego ponerlo en el título de la CARD, ya que aquí está escrito con mayúsculas
    //                 attributes.pruebaCard = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;

    //                 var speechOutput = undefined;
    //                 var reprompt = undefined;
    //                 var cardTitle = undefined;
    //                 var cardBody = undefined;
    //                 var errorOccured = false;

    //                 await mainIntentsHandler.masInfoDatoSearchRequestFunction(attributes)
    //                     .then((response) => {
    //                         speechOutput = response.speechOutput;
    //                         reprompt = response.reprompt;
    //                         cardTitle = response.cardTitle;
    //                         cardBody = response.cardBody;
    //                         attributes = response.attributes;
    //                     })
    //                     .catch((err) => {
    //                         errorOccured = true;
    //                         speechOutput = constants.errorMessage;
    //                         reprompt = constants.errorMessage;
    //                         attributes = err.attributes;
    //                     });

    //                 handlerInput.attributesManager.setSessionAttributes(attributes);

    //                 if (attributes.display) {
    //                     if (errorOccured) {
    //                         var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                     else {
    //                         var template = mainIntentsHandler.getMasInfoDisplay(attributes);
    //                         return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                     }
    //                 } else {
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).withSimpleCard(cardTitle, cardBody).getResponse();
    //                 }

    //             }

    //         }
    //     }
    // } else if (intentName === 'masInfoTratamiento') {
    //     console.log("Intent: masInfoTratamiento");

    //     var useMemoryValues = false;
    //     if (typeof attributes.bodyResponse != 'undefined' && typeof request.intent.slots.dato.value == 'undefined') {
    //         useMemoryValues = true;
    //     }

    //     if (useMemoryValues == false) {
    //         //como ha especificado un valor de consulta nuevo o no hay limpiamos
    //         attributes.bodyResponse = undefined;

    //         if (typeof request.intent.slots.dato.value == 'undefined') {
    //             return handlerInput.responseBuilder.addDelegateDirective(intent).getResponse();
    //         }
    //         // Obtener el nombre del slot que se ha preguntado
    //         let pruebaSlot = resolveCanonical(request.intent.slots.dato);
    //         console.log("pruebaSlot " + pruebaSlot);

    //         if (typeof request.intent.slots.dato.resolutions == 'undefined' || typeof request.intent.slots.dato.resolutions.resolutionsPerAuthority[0] == 'undefined' || request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH') {
    //             var speechOutput = undefined;
    //             var reprompt = undefined;
    //             var errorOccured = false;

    //             await mainIntentsHandler.queEsDatoNoFoundRequestFunction(attributes)
    //                 .then((response) => {
    //                     speechOutput = response.speechOutput;
    //                     reprompt = response.reprompt;
    //                 })
    //                 .catch((err) => {
    //                     errorOccured = true;
    //                     speechOutput = constants.errorMessage;
    //                     reprompt = constants.errorMessage;
    //                 });

    //             handlerInput.attributesManager.setSessionAttributes(attributes);

    //             if (attributes.display) {
    //                 if (errorOccured) {
    //                     var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                 }
    //                 else {
    //                     var template = mainIntentsHandler.getMasInfoDisplay(attributes);
    //                     return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //                 }
    //             } else {
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).getResponse();
    //             }
    //         } else {
    //             // Tenemos el dato. Queremos comprobar si su ID es alfanumérico.
    //             // Si es alfanumérico, llamamos al servicio con el value.
    //             if (utils.containsNumber(request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id) == true) {
    //                 attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //                 // Si no lo es significa que lo hemos especificado nosotros en Developer Alexa, así que llamamos al servicio con el ID
    //             } else {
    //                 attributes.pruebaNombre = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    //             }
    //             // Guardamos el value del Slot para luego ponerlo en el título de la CARD, ya que aquí está escrito con mayúsculas
    //             attributes.pruebaCard = request.intent.slots.dato.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //         }

    //         var speechOutput = undefined;
    //         var reprompt = undefined;
    //         var cardTitle = undefined;
    //         var cardBody = undefined;
    //         var errorOccured = false;

    //         await mainIntentsHandler.masInfoTratamientoSearchRequestFunction(attributes)
    //             .then((response) => {
    //                 speechOutput = response.speechOutput;
    //                 reprompt = response.reprompt;
    //                 cardTitle = response.cardTitle;
    //                 cardBody = response.cardBody;
    //                 attributes = response.attributes;
    //             })
    //             .catch((err) => {
    //                 errorOccured = true;
    //                 speechOutput = constants.errorMessage;
    //                 reprompt = constants.errorMessage;
    //                 attributes = err.attributes;
    //             });

    //         handlerInput.attributesManager.setSessionAttributes(attributes);

    //         if (attributes.display) {
    //             if (errorOccured) {
    //                 var template = mainIntentsHandler.getErrorDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //             else {
    //                 var template = mainIntentsHandler.getMasInfoDisplay(attributes);
    //                 return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).addRenderTemplateDirective(template).getResponse();
    //             }
    //         } else {
    //             return handlerInput.responseBuilder.speak(speechOutput).reprompt(reprompt).withSimpleCard(cardTitle, cardBody).getResponse();
    //         }

    //     }

    // }
  } catch (error) {
    console.log("---------MainIntentHandler try error----------" + error);

    // > FER: cambio attributes => _attributes
    handlerInput.attributesManager.setSessionAttributes(_attributes);
    return handlerInput.responseBuilder
      .speak(constants.errorMessage)
      .reprompt(constants.errorMessage)
      .getResponse();
  }
};

const futureIntentsHandlerFunction = async function(agent) {
  //Init session attributes
  console.log("futureIntentsHandlerFunction INIT");

  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

  let errorOccured = false;
  let conv = agent.conv();
  //var intentName = agent.intent;

  // If the context exists
  if (agent.contexts != undefined) {
    let attributesContext = agent.getContext("attributes");
    console.log(
      "We have attributes from context: " +
        JSON.stringify(attributesContext, null, 4)
    );
    // If the context is undefined
    if (attributesContext != undefined) {
      if (attributesContext != undefined) {
        console.log(
          "We have attributes parameters: " +
            JSON.stringify(attributesContext.parameters.attributes, null, 4)
        );
        _attributes.init(attributesContext.parameters.attributes);
      }
    }
  }

  try {
    console.log("Intent: futureIntentsHandler");

    await futureIntentsHandler
      .FutureIntentFunction()
      .then(response => {
        console.log("We have a response");

        _deviceResponse = response.deviceResponse;

        console.log(
          "_attributes: " + JSON.stringify(_attributes.toJSON(), null, 4)
        );
        console.log(
          "_deviceResponse: " +
            JSON.stringify(_deviceResponse.toJSON(), null, 4)
        );
      })
      .catch(err => {
        console.log("err " + err);
        errorOccured = true;
        _deviceResponse.displayText = constants.errorMessage;
        _deviceResponse.speechText = constants.errorMessage;
        _deviceResponse.repromptText = constants.errorMessage;
      });

    agent.setContext({
      name: "attributes",
      lifespan: 5,
      parameters: {
        attributes: _attributes.toJSON()
      }
    });

    if (_display) {
      console.log("We have a display");
      if (errorOccured) {
        // var template=mainIntentsHandler.getErrorDisplay(attributes);
        // TODO Screens.
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      } else {
        console.log("We do not have a display");
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      }
    } else {
      console.log("We do not have a display");
      conv.ask(
        new SimpleResponse({
          speech: _deviceResponse.speechText,
          text: _deviceResponse.displayText
        })
      );
    }

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
    console.log("Intent: futureIntentsHandler END");
  } catch (error) {
    console.log("---------futureIntentsHandler try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

const stopIntentsHandlerFunction = async function(agent) {
  //Init session attributes
  console.log("stopIntentsHandlerFunction INIT");

  _display = false; //conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

  let errorOccured = false;
  let conv = agent.conv();

  // If the context exists
  if (agent.contexts != undefined) {
    let attributesContext = agent.getContext("attributes");
    console.log(
      "We have attributes from context: " +
        JSON.stringify(attributesContext, null, 4)
    );
    // If the context is undefined
    if (attributesContext != undefined) {
      if (attributesContext != undefined) {
        console.log(
          "We have attributes parameters: " +
            JSON.stringify(attributesContext.parameters.attributes, null, 4)
        );
        _attributes.init(attributesContext.parameters.attributes);
      }
    }
  }

  try {
    console.log("Intent: stopIntentsHandler");

    await stopHandler
      .StopRequestFunction()
      .then(response => {
        console.log("We have a response");

        _deviceResponse = response.deviceResponse;

        console.log(
          "_attributes: " + JSON.stringify(_attributes.toJSON(), null, 4)
        );
        console.log(
          "_deviceResponse: " +
            JSON.stringify(_deviceResponse.toJSON(), null, 4)
        );
      })
      .catch(err => {
        console.log("err " + err);
        errorOccured = true;
        _deviceResponse.displayText = constants.errorMessage;
        _deviceResponse.speechText = constants.errorMessage;
        _deviceResponse.repromptText = constants.errorMessage;
      });

    agent.setContext({
      name: "attributes",
      lifespan: 5,
      parameters: {
        attributes: _attributes.toJSON()
      }
    });

    if (_display) {
      console.log("We have a display");
      if (errorOccured) {
        // var template=mainIntentsHandler.getErrorDisplay(attributes);
        // TODO Screens.
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      } else {
        console.log("We do not have a display");
        conv.ask(
          new SimpleResponse({
            speech: _deviceResponse.speechText,
            text: _deviceResponse.displayText
          })
        );
      }
    } else {
      console.log("We do not have a display");
      conv.ask(
        new SimpleResponse({
          speech: _deviceResponse.speechText,
          text: _deviceResponse.displayText
        })
      );
    }

    let data = conv.serialize();
    console.log("data: %j", data);
    agent.add(new Payload("ACTIONS_ON_GOOGLE", data.payload.google));
    console.log("Intent: stopIntentsHandler END");
  } catch (error) {
    console.log("---------stopIntentsHandler try error----------" + error);
    agent.add(constants.errorMessage);
  }
};

module.exports.handlerWelcomeFunction = handlerWelcomeFunction;
module.exports.handlerGoodbyeFunction = handlerGoodbyeFunction;
module.exports.provideDNI = provideDNI;
module.exports.indicarPrueba = indicarPrueba;
module.exports.indicarVolante = indicarVolante;

module.exports.helpFunction = helpFunction;
module.exports.genericHandlerFunction = genericHandlerFunction;
module.exports.handlerQueEsDatoFunction = handlerQueEsDatoFunction;
module.exports.futureIntentsHandlerFunction = futureIntentsHandlerFunction;
module.exports.stopIntentsHandlerFunction = stopIntentsHandlerFunction;
module.exports.RequestVolante = RequestVolante;

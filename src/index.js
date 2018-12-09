"use strict";

//libraries
const express = require("express");
const bodyParser = require("body-parser");
const errorhandler = require("errorhandler");
const winston = require("winston");
const expressWinston = require("express-winston");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion, Text, Payload } = require("dialogflow-fulfillment");

//myImports
const constants = require("./Utils/constants").getConstants();
const handlers = require("./Handlers/handler");

//Config
const PORT = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("port", PORT);

// Log the whole request and response body
expressWinston.requestWhitelist.push("body");
expressWinston.responseWhitelist.push("body");

// Error logger
app.use(
  expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  })
);

function monitoring(req, res) {
  return res.status(200).json({
    status: {
      code: 200,
      message: "Response OK"
    }
  });
}

function getWebhook(req, res) {
  return res.status(200).json({
    status: {
      code: 200,
      message: "Method GET not supported for this web service"
    }
  });
}

function processRequest(request, response) {
  try {
    // console.log("processRequest start %j", request);
    console.log("processRequest start ", JSON.stringify(request.body));

    //    if (request.headers.authorization !== 'Basic ZnNhbnRvcm86RnMyMDA0MjAxOC4u') {
    //      return response.status(401).json({
    //        status: 401,
    //        message: "Invalid credentials"
    //      });
    //    }

    const agent = new WebhookClient({ request, response });
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", handlers.handlerWelcomeFunction);
    intentMap.set("Request_DNI", handlers.requestDNI);
    intentMap.set("RequestVolante", handlers.RequestVolante);

    // Intents con formato:  =>  intentMap.set('',handlers.);

    agent.requestSource = "ACTIONS_ON_GOOGLE";
    agent.handleRequest(intentMap);

    // console.log("processRequest end %j", response);
  } catch (error) {
    console.log("---------processRequest try error----------" + error);
    return response.status(400).json({
      status: {
        code: 400,
        errorType: error.message
      }
    });
  }
}

app
  .route("/monitoringwebhook")
  .post(monitoring)
  .get(monitoring);

app
  .route("/webhook")
  .post(processRequest)
  .get(getWebhook);

app.use(errorhandler);

app.listen(PORT, function() {
  console.log("Server listening on port " + PORT);
});

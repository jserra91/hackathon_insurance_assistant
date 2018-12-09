// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'importado-224808';

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
  keyFilename: './credentials.json'
});

// The kind for the new entity
const kind = 'usuarios';
// The name/ID for the new entity
//const name = 'welcomeOutput2';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
  "cardBody": "Hola, ¿quieres información sobre pruebas médicas, enfermedades y/o tratamientos?",
  "Medikfy2": "Medikfy",
  "name": "testformacion",
  "reprompt": "Perdona, no te he entendido. ¿Qué enfermedad, prueba médica o tratamiento necesitas consultar?",
  "templateBody": [
    "Prueba a decir: \"¿Qué es la Gastroenteritis?\"",
    "Prueba a decir: \"¿Qué es una biopsia\"",
    "Prueba a preguntar: \"¿Qué es la Enfermedad de Crohn?\"",
    "Prueba a preguntar: \"¿Qué es la Diabetes?\"",
    "Prueba a preguntar: \"¿Qué es la Rizólisis?\"",
    "Prueba a decir: \"¿Qué es una Ecografía 4D?\""
  ],
  "text": [
    "¡Te doy la bienvenida a Medikfy! Estoy aquí para resolver tus dudas sobre salud, enfermedades, pruebas médicas y tratamientos. ¿Con qué te puedo ayudar?",
    "¡Hola, bienvenido a Medikfy! Puedes consultarme las dudas que tengas sobre enfermedades, pruebas médicas o tratamientos. ¿En qué te puedo ayudar?"
  ]
}
};

// Saves the entity
datastore
  .save(task)
  .then(() => {
    console.log(`Saved ${task.key.id}: ${task.data.description}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

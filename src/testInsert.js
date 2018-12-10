// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'gcloudpjf';

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
  keyFilename: './credentials.json'
});

// The kind for the new entity
const kind = 'Usuarios';
// The name/ID for the new entity
//const name = 'welcomeOutput2';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
  "dni": "75842986J",
  "email": "cliente3@gmail.com",
  "nombre": "Luis",
  "Apellidos": "Sanchez",
  "telefono": "666666662",
  "poliza":"4110600000000003",
  "simple": [
    "consulta",
	"análisis clínicos",
	"radiografía"
  ],
  "media": [
    "tac",
    "resonancia"
  ],
  "compleja": [
    "Operación",
    "Intervención"	
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

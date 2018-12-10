//var AWS = require('aws-sdk');

//var docClient = new AWS.DynamoDB.DocumentClient();

// Imports the Google Cloud client library
const Datastore = require("@google-cloud/datastore");

// Your Google Cloud Platform project ID
const projectId = "gcloudpjf";

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
  keyFilename: "./credentials.json"
});

async function getDni(dni) {
  return new Promise((resolve, reject) => {
    try {
      var query = datastore
        .createQuery("Usuarios")
        .filter("dni", "=", dni);
      datastore
        .runQuery(query)
        .then(results => {
          resolve({ Items: results[0] });
        })
        .catch(error => {
          console.error("ERROR:", error);
          reject(error);
        });
    } catch (error) {
      console.log(
        "---------dbController.getConstant try error----------" + error
      );
      reject(error);
    }
  });
}

async function inserTramite(prueba, attributesContext) {
  return new Promise((resolve, reject) => {
    try {
		// The kind for the new entity
		const kind = 'Tramitaciones';
		// The name/ID for the new entity
		//const name = 'welcomeOutput2';
		// The Cloud Datastore key for the new entity
		const taskKey = datastore.key([kind]);

		const task = {
		  key: taskKey,
		  data: {
		  "dni": attributesContext.parameters.attributes.resultados.Items[0].dni,
		  "email": attributesContext.parameters.attributes.resultados.Items[0].email,
		  "nombre": attributesContext.parameters.attributes.resultados.Items[0].nombre,
		  "apellidos": attributesContext.parameters.attributes.resultados.Items[0].Apellidos,
		  "telefono": attributesContext.parameters.attributes.resultados.Items[0].telefono,
		  "poliza":attributesContext.parameters.attributes.resultados.Items[0].poliza,
		  "prueba": prueba
		}
		};

		// Saves the entity
		datastore
		  .save(task)
		  .then(() => {
			console.log(`Saved ${task.key.id}: ${task.data.description}`);
			 resolve({ id: task.key.id });
		  })
		  .catch(err => {
			console.error('ERROR:', err);
			reject(error);
		  });

    } catch (error) {
      console.log(
        "---------dbController.getConstant try error----------" + error
      );
      reject(error);
    }
  });
}

async function insertAutorizacion(volante, attributesContext) {
  return new Promise((resolve, reject) => {
    try {
		// The kind for the new entity
		const kind = 'Autorizaciones';
		// The name/ID for the new entity
		//const name = 'welcomeOutput2';
		// The Cloud Datastore key for the new entity
		const taskKey = datastore.key([kind]);

		const task = {
		  key: taskKey,
		  data: {
		  "dni": attributesContext.parameters.attributes.resultados.Items[0].dni,
		  "email": attributesContext.parameters.attributes.resultados.Items[0].email,
		  "nombre": attributesContext.parameters.attributes.resultados.Items[0].nombre,
		  "apellidos": attributesContext.parameters.attributes.resultados.Items[0].Apellidos,
		  "telefono": attributesContext.parameters.attributes.resultados.Items[0].telefono,
		  "poliza":attributesContext.parameters.attributes.resultados.Items[0].poliza,
		  "prueba":attributesContext.parameters.Prueba_medica,
		  "volante": volante	
		}
		};

		// Saves the entity
		datastore
		  .save(task)
		  .then(() => {
			console.log(`Saved ${task.key.id}: ${task.data.description}`);
			 resolve({ id: task.key.id });
		  })
		  .catch(err => {
			console.error('ERROR:', err);
			reject(error);
		  });

    } catch (error) {
      console.log(
        "---------dbController.getConstant try error----------" + error
      );
      reject(error);
    }
  });
}

module.exports.getDni = getDni;
module.exports.inserTramite = inserTramite;


module.exports.insertAutorizacion = insertAutorizacion;

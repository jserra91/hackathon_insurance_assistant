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
        .createQuery("Autorizaciones")
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

async function insertVolante(volante, autorizacion, dni) {
  console.log("dbController :: insertVolante :: volante " + volante);
  console.log("dbController :: insertVolante :: autorizacion " + autorizacion);
  console.log("dbController :: insertVolante :: dni " + dni);
  const key = datastore.key(["dni", dni]);
  const entity = {
    key: key,
    data: {
      volante: volante,
      autorizacion: autorizacion
    }
  };

  datastore.save(entity, err => {
    console.log(key.path); // [ 'Company', 5669468231434240 ]
    console.log(key.namespace); // undefined
  });
}

module.exports.getDni = getDni;
module.exports.insertVolante = insertVolante;

const request = require('request');

var appId = 'af82b476';
var appKey = '5cb8b960e12615844828b2c21770d3d9';
var _timeout=6000;
		

function getPruebaInfo(nombre, tipo, callback){
	try{
	request.post({
            timeout: _timeout,            
			url:'https://geodb.dev.medikfy.com/articles/_search',
			json:true,
			body:{
				"_source": {},
				"query": {
				  "bool": {
					"must": [
					  {
						"query_string": {
						  "query": "\""+nombre+"\"",
						  "analyze_wildcard": true,
						  "default_field": "title"
						}
					  },
					  {
						"match":{
							"Type": tipo
						}
					  }
					]
				  }
				}
			  }

        }, (err, res, body) => {
                            if(err){
                                console.log('Error ' + err);
                                callback(err,null);
                            }else{
								console.log("Getting info of " + nombre);
                                if(res.statusCode == '200' && typeof res.body.error == 'undefined'){                                     
                                    //var obj=JSON.parse(body);
                                    console.log("res %j",res);
                                    console.log("body %j",body);
                                    callback(null,body);
                                }else{
                                    console.log('Error ' + res.statusCode+ " %j", body);
                                    callback("err",null);
                                }
                            }
    }).on('error', function (error) {
		console.log("----------getPruebaInfo call error. Error description: " + error);
		if (error.code === 'ETIMEDOUT') {
			console.log("----------getPruebaInfo ETIMEDOUT. Error description: " + error);
			callback("on error", null);
		}
	}).on('timeout', function (error) {
		console.log("----------getPruebaInfo call timeout. timeout description: " + error);
		callback("timeout", null);
	}).on('socket', function (socket) {
		console.log("----------v call socket. socket description: " + socket);
		socket.setTimeout(_timeout);
		socket.on('timeout', function (error) {
			console.log("----------getPruebaInfo call socket timeout. socket timeout description: " + error);
			callback("timeout", null);
		});
	});

	}catch(error){
	    console.log("---------getPruebaInfo try error----------" + error);
	    callback(error, null);
	} 
}	
			
						
			
module.exports.getPruebaInfo = getPruebaInfo;
		
			
			                      

                    
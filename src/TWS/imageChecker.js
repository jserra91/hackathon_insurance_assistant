var urlExists = require('url-exists');

function checkDarkImage(path, name, callback){
	try{
		var imageUrl=path+name;
 
		urlExists(imageUrl, function(err, exists) {
			if(err){
				callback(error,null);
			}else{
				callback(null,exists);
			}
		});
		 
	}catch(error){
		//console.log("---------getPruebaInfo try error----------" + error);
		callback(error,null);
	} 
	
}

module.exports.checkDarkImage = checkDarkImage;



"use strict";


class Utils{	

		//returns a random index for a response array given its length
		static getRandomIndexOfArray(length){
			var result=Math.floor(Math.random()*Number(length));
			return result;
		}

		static containsNumber(str){
			return /\d/.test(str);
		}


}

module.exports=Utils;
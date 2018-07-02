const fs = require('fs');
const path = require('path');


let build = function (basepath){
	return new Promise(function(resolve,reject){
		fs.readdir(basepath,function(err,files){
			if(err)return reject(err);
			return resolve(files);
		});
	});
}

let target = '.';
if (process.argv.length > 2)
	target = process.argv[2];

console.log('target', target);

build(target)
.then(console.log)
.catch(console.error);

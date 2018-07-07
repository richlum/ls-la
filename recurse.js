const fs = require('fs');
const path = require('path');


function dir(root){
	return new Promise(function(resolve,reject){
		fs.readdir(root,function(err,files){
			if (err) return reject(err);
			return resolve (files);
		});
	});
}

function isdir(file){
	return new Promise(function(resolve,reject){
		fs.stat(file,function(err,stats){
			if(err) return reject(err);
			return resolve(stats.isDirectory());
		});
	});
}

function filesOnly(files){
	let resultlist = files.map(file => new Promise(function(resolve,reject){
		isdir(file)
		.then( (isdir) => { 
			if (!isdir) {
				return resolve(file);
			}else{
				return resolve(0);
			}
		})
		.catch( err => { return reject(err); });
		})
	);

	let filesonly = [];
	return Promise.all(resultlist)
		.then((files) => {
			filesonly = files.filter( (file) => { 
				return (file != 0); 
			});
			return Promise.resolve(filesonly);
		});
}
		

exports.dir = dir;
exports.isdir = isdir;
exports.filesOnly = filesOnly;

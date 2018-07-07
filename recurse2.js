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
			console.log(18, file, stats.isDirectory());
			return resolve(stats.isDirectory());
		});
	});
}

function filesOnly(files){
	let resultlist = files.map(file => new Promise(function(resolve,reject){
	//let resultlist = files.map(file => { //new Promise(function(resolve,reject){
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

	console.log('resultlist', resultlist);
	let filesonly = [];
	Promise.all(resultlist)
	.then((files) => {
		console.log(43,files);
		let filterlist = files.filter( (file) => { 
			console.log(45,file);
			return (file != 0); } );
		console.log(47,'filterlist',filterlist);
		return filterlist;
	})
	.then((x) => { console.log(50,x); return x; })
	.then( (files) => {
		console.log(53,files);
		filesonly = files;
		console.log(54,filesonly);
		return filesonly; })
	.catch(console.error);
	console.log('filesOnly',57,filesonly);
	return resolve(filesonly);
}
		

exports.dir = dir;
exports.isdir = isdir;
exports.filesOnly = filesOnly;

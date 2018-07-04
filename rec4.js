const fs = require('fs');
const path = require('path');


let build = function (basepath){
	return new Promise(function(resolve,reject){
		fs.readdir(basepath,function(err,files){
			if(err)return reject(err);
			files.map( (file) => {
				return path.resolve(basepath,file)
			});
			return resolve(files);
		});
	});
}

let isdir = function(fn){
	return new Promise(function(resolve,reject){
		fs.stat(fn,function(err,stats){
			if(err) return reject(err);
			//console.log('stats',fn,stats.isDirectory());
			return resolve (stats.isDirectory());
		});
	});
}

let classify = function(filesarray){
	let fileobj = {};
	fileobj.dirs = [...filesarray];
	fileobj.files = [...filesarray];

	//console.log('classify',fileobj);
	
	fileobj.dirs = fileobj.dirs.map(
		(file) => {
			return new Promise(function(resolve,reject){ 
				isdir(file).then( (is_dir) => {
					is_dir ? resolve(file) : resolve(0) ;
				});
			});
		});
	fileobj.files = fileobj.files.map( 
		(file) => { 
			return new Promise(function(resolve,reject){
				!isdir(file).then( (is_dir) => {
					!is_dir ? resolve(file) : resolve(0) ;
				});
			});
		});

  //console.log(51,fileobj);
	let result = Promise.all(fileobj.dirs)
		.then ( (dirs) => {
//			console.log(55,dirs);
			fileobj.dirs = dirs.filter( (file) => { 
				return file != 0; 
			});
		//	console.log(58,fileobj.dirs);
		//	console.log(58,fileobj);
		})
		.then(() => Promise.all(fileobj.files))
		.then( (files) => {
				fileobj.files = files.filter( (file) => { 
					return file != 0; 
				});
			//	console.log(67,fileobj.files);
		})
		.then( () => {
				//console.log('resolved 70',fileobj); 
				return (fileobj); 
		});
	return result;
		
};

			


let target = '.';
if (process.argv.length > 2)
	target = process.argv[2];

console.log('target', target);

build(target)
.then( (x) => { console.log(108,x);  return x; })
.then(classify)
.then( (x) => { console.log(110,x);  return x; })
.catch(console.error);

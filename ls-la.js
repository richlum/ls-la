let fs = require('fs');
let path = require('path');

//console.log(__dirname);


let filescan = function(pth){
	return new Promise(function(resolve,reject){
		let fullpath = path.resolve(pth);
		fs.readdir(fullpath, function(err, files){
			if (err) return reject(err);
			return resolve(files.map((fl) => {
				return path.resolve(pth,fl); 
			}));
		});
	});

}

let isDir = function (fn){
	return new Promise(function(resolve,reject){
		fs.stat(fn,function(err,stats){
			if (err) return reject(err);
			return resolve(stats.isDirectory());
		});
	});
}

let mapFiles = function (filesarray) {
	let fileobjarray =	filesarray.map( (filename) => {
				let fileobj = {};
				fileobj.name = path.resolve(filename);
				return fileobj;
				//fileobj.isDir = isDir(filename);
	});
	console.log('filesarray',filesarray);
	console.log('fileobjarray',fileobjarray);
	return fileobjarray;
};	
let is_dir = function(fl_obj){
	console.log('fl_obj',fl_obj);
	return new Promise(function (resolve,reject){
		fs.stat(fl_obj.name , function (err,stats){
			if (err) return reject(err);
			fl_obj.isDir = stats.isDirectory();
			return resolve(fl_obj);
		});
	})
}

let classifyFile = function (fileobjarray){
	console.log('classifyfile',fileobjarray);
	let result =  fileobjarray.map( (fileobj) => {
		return is_dir(fileobj);
	});
	return Promise.all(result);
};
		


let startdir = path.resolve(".");
if (process.argv.length > 2){
	startdir = process.argv[2];
}


console.log('startdir',startdir);

let fileobjs = filescan(startdir).then( mapFiles)
.then((x) => {console.log(x);return x;})
.then( classifyFile)
.then(console.log)
.catch(console.error);




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
	//console.log('filesarray',filesarray);
	//console.log('fileobjarray',fileobjarray);
	return fileobjarray;
};	

let is_dir = function(fl_obj){
	//console.log('fl_obj',fl_obj);
	return new Promise(function (resolve,reject){
		fs.stat(fl_obj.name , function (err,stats){
			if (err) return reject(err);
			fl_obj.isDir = stats.isDirectory();
			return resolve(fl_obj);
		});
	})
}

let classifyFile = function (fileobjarray){
	//console.log('classifyfile',fileobjarray);
	let result =  fileobjarray.map( (fileobj) => {
		return is_dir(fileobj);
	});
	return Promise.all(result);
};
		

let insertSubdirInfo = function(fileobjarray){

	console.log('63 fileobjarray into insertSubdirinfo' , fileobjarray);
	let files = fileobjarray.map( (fileobj) => {
		if (fileobj.isDir) {
			console.log('66 fileobj',fileobj);
		  return new Promise(function(resolve,reject){				
				filescan(fileobj.name).then( (files) => {   // recursive call 
					console.log('69 files',files);
			 		fileobj.files = files;
					console.log('72 returning fileobj',fileobj);
					return resolve(fileobj);
				}).catch(err => reject(err));;
			});
		} else {
			console.log('75 notdir returning ' , fileobj);
			return fileobj;
		}
	});

	let result = Promise.all(files)
	console.log ('81 subdirinfo files;',result);
  return result;
}

let recursiveSubdirInfo = function (fileobjarray){
	let files = fileobjarray.map( (fileobj) => {
		let result ;
		if (fileobj.isDir){
			return new Promise(function(resolve,reject){
				filescan(fileobj.name)
				.then(mapFiles)
				.then(classifyFile)
				.then(recursiveSubdirInfo)
				
				.catch(err => reject(err));
			}); 
		} else {
			return fileobj;
		}
	});
	let result = Promise.all(files);
	return result;
};
	

let startdir = path.resolve(".");
if (process.argv.length > 2){
	startdir = process.argv[2];
}


console.log('startdir',startdir);
/*
let fileobjs = filescan(startdir).then( mapFiles)
.then((x) => {console.log(96,x);return x;})
.then( classifyFile)
.then((x) => {console.log(98,x);return x;})
.then(insertSubdirInfo)
.then((x) => {console.log(100,x);return x;})
.catch(console.error);

console.log(103,fileobjs);
*/
let fileobjs = filescan(startdir)
	.then(mapFiles)
	.then(classifyFile)
	.then( recursiveSubdirInfo )
	.catch(console.error);

console.log(129,fileobjs);

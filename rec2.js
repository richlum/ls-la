const fs = require('fs');
const path = require('path');


let build = function (basepath){
	return new Promise(function(resolve,reject){
		fs.readdir(basepath,function(err,files){
			if(err)return reject(err);
			return resolve({"basepath": basepath, "files": files});
		});
	});
}

let isdir = function(fn){
	return new Promise(function(resolve,reject){
		fs.stat(fn,function(err,stats){
			if (err) return reject(err);
			let result  = {};
			result.fn = path.basename(fn);
			result.filename=path.resolve(fn);
			result.isdir=stats.isDirectory();
			console.log('isdir', result);
			return resolve(result);
		});
	});
}

let classify = function(filelistobj){
	return new Promise(function(resolve,reject){
    	let results = filelistobj.files.map( (fn) => {
    		return isdir(path.resolve(filelistobj.basepath,fn));
    	});
    	Promise.all(results).then( (result) => {
    		
    		result = Array.from(result);
			console.log('36 array from result',result);
    		
    		let dirs = result.filter( (obj) => {
    			return obj.isdir;
    		});

			// recurse on the diretory entries
			dirs.map( (dirobj) => {
				let result = dirobj; console.log('43 result',result);
				build(dirobj.filename)
				.then(classify)
				.then(  x => {
					return Promise.all(x)
				})
				.then( (x) => {  console.log('51 x', x);
					dirobj['files'] = x;
					  
					console.log('53 result ' , result);
					return result;
				})
				.catch(err => reject(err));
			})
			Promise.all(dirs)  // resolve arrays of promises for directories.
			.then( (dirs) => { 
				console.log('59 dirs',dirs);
		//		let newresults = results;
				dirs.forEach( (dir) => { 
					console.log('60 dir', dir);
					let matchidx = results.findIndex( (el) => { results[el.filename] === el.filename}) ;
					if (matchidx > 0){
						results[matchidx] = dir;
						console.log('67 insert results',results);
					} 
				});
				console.log('69 newresults', results);
				return results;
			})
			.then( result => {
				return Promise.all(result);
			} )
			.then( (dirs) => {
				console.log('65 dirs',dirs);
				return dirs;
			})
			.then( (x) => {
				console.log('77 result',x);
    			return resolve(results);
			})
			.catch(reject);	
    	})
		.catch( error => reject(error));
	});
}


let target = '.';
if (process.argv.length > 2)
	target = process.argv[2];

console.log('target', target);

build(target)
.then((x) => { console.log('build',x); return x; })
.then(classify)
.then( (x) => {
	Promise.all(x)
	.then(
		(x) => { 
			console.log('107 classify',x); 
			return x; 
		})
})	
.catch(console.error);

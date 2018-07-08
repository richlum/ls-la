let path = require('path');

let recurse = require('./recurse.js');

let root = '.';
if (process.argv.length > 2 )
	root = process.argv[2]; 

recurse.dir (root)
.then( (allfiles) => {
	return Promise.all([ recurse.filesOnly(allfiles),
				  recurse.dirsOnly(allfiles)])
	.then( (results) => {
		console.log(12,results);
		let cwd = {};
		cwd.files = results[0];
		cwd.dirs  = results[1];
		cwd.fullpath = path.resolve(root);
		return cwd;
	}).catch(console.error);
})
.then ((files) => {
	console.log('files at root',13,files);
})
.catch(err => console.error);


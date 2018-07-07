let recurse = require('./recurse.js');

let root = '.';
if (process.argv.length > 2 )
	root = process.argv[2]; 

recurse.dir (root)
.then( (allfiles) => {
	let result = recurse.filesOnly(allfiles);
	return result;
})
.then ((files) => {
	console.log('files at root',13,files);
})
.catch(err => console.error);


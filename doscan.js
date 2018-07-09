const recurse = require('./recurse');

let rootdir = '.';
if (process.argv.length>2)
	rootdir = process.argv[2];

recurse.scandir(rootdir)
.then ( (x) => { 
	console.log(x);
	return x;
})
.then ( (x) => {
	console.log(13,x);
	return recurse.copydirs (x) ;
})
.then( (x) => { 
	console.log(18,x);
	return x;
})
.then( (x) => {
	console.log(20,x);
	return recurse.copyfiles(x);
})
.then( (x) => {
	console.log(25,x);
	return recurse.dirnameToDirObj(x);
})
.catch(console.error)



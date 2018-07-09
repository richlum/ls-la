let prom1 = new Promise(function(resolve,reject){
	setTimeout(resolve,2100,'prom1 success');
}).then(console.log);

let prom2 = new Promise((resolve,reject)=> 
	setTimeout(resolve,300,'prom2,success')
).then(console.log);


Promise.resolve('promtestresolve').then(console.log);
setTimeout(console.log , 20 , 'prom3 resolve');
//setTimeout(Promise.resolve , 20 , 'prom3 resolve');



let echo = function echo(x) {
	 console.log(x);
}


setTimeout(function(){console.log('help');},100);


let protoprom = (timet) => (promid) => {
	console.log(timet,promid);

	return new Promise(function(resolve,reject){
		setTimeout(resolve,timet,'prom' + promid + ' success');
	});
}

protoprom(1000)(33);

 
let proms = [];
for (let i=10;i<20;i++){
	proms.push( protoprom(10000 - (i*100))(i) );
}

proms.reduce((p,f) => p.then(f), Promise.resolve());

/*
console.log('proms' , proms);
Promise.all(proms)
.then(x => { console.log(x);  return x; })
.then(x => console.log('done'))
.then( console.log('done2'))
*/







console.log('end of file reached');

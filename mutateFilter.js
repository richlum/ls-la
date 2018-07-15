

let obj1 = { name: 'a',
			cnt : 1 };

let obj2 = { name: 'b',
			 cnt : 2 };

let obj3 = { name: 'c',
			 cnt : 3};

const mycol = [];
mycol.push(obj1);
mycol.push(obj2);
mycol.push(obj3);

if (mycol[0] === obj1 ) console.log("0 equals");
if (mycol[1] === obj2 ) console.log("1 equals");
if (mycol[2] === obj3 ) console.log("2 equals");


mycol[0].name = 'd';
console.log(obj1);
console.log('---------------');
let newcol = mycol.filter( item => item.cnt <=2 );

newcol.forEach( it => console.log(it) );

console.log('---------------');
newcol.forEach( it => it.cnt = it.cnt *2);
newcol.forEach( it => console.log(it) );

console.log('---------------');

mycol.forEach( it => console.log(it) );

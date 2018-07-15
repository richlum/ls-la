class Student {
  fullName: string;
  constructor(
    public firstName: string, 
    public middleInitial, 
    public lastName: string){

    this.fullName = firstName + " " + middleInitial + " " + lastName;
  }
}

interface Person {
  firstName: string;
  lastName: string;
 //phone: string;
}

function greeter(person: Person){
  let a:string = "Hello";
  let b:number = 123;
  let c:string = newFunction();
  return "Hello, " + person.firstName + " " + person.lastName
    + " " + c;

  function newFunction(): string {
    return a + " " + b;
  }
}

let user = new Student("Jane","M.","User");
console.log(greeter(user));
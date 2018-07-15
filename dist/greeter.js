class Student {
    constructor(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}
function greeter(person) {
    let a = "Hello";
    let b = 123;
    let c = newFunction();
    return "Hello, " + person.firstName + " " + person.lastName
        + " " + c;
    function newFunction() {
        return a + " " + b;
    }
}
let user = new Student("Jane", "M.", "User");
console.log(greeter(user));
//# sourceMappingURL=greeter.js.map
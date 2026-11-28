// function findOutlier(integers){
  
//   for( i = 0; i < integers.length; i++){
//     if(integers[i] % 2 !== 0){
//       return integers[i]
//     }
//   }
//   return
// }

// console.log(findOutlier([22,4,5,6,8,10] ))



function removeExclamationMark(str){
   let word = ""
  for(i=0;i<str.length;i++){
    if(str[i]!== "!"){
      return word += str[i]
    }
  }
  return word
}

console.log(removeExclamationMark("Hello!"))



const person={
  names:"Gedeon",
  age:27,
  salary:3000,
  laguege:"English",
  salaryPerMonth:function(tips){
    return `This is the salary of ${person.names} per month ${(this.salary + tips)*31}`
  }

}
console.log(person.salaryPerMonth(500))


function Person(name) {
  this.name = name;
}

Person.prototype.sayName = function() {
  console.log(`Hello, I'm ${this.name}!`);
};

function Player(name, marker) {
  this.name = name;
  this.marker = marker;
}

Player.prototype.getMarker = function() {
  console.log(`My marker is "${this.marker}"`);
};

Object.getPrototypeOf(Player.prototype); 


Object.setPrototypeOf(Player.prototype, Person.prototype);
Object.getPrototypeOf(Player.prototype); 

const player1 = new Player("steve", "X");
const player2 = new Player("also steve", "O");

player1.sayName(); 
player2.sayName();

player1.getMarker(); 
player2.getMarker(); 
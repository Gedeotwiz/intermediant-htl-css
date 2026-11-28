// class Car {

//     constructor(brand, color, model) {
//         this.brand = brand;
//         this.color = color;
//         this.model = model;
//     }

// }

// const car1 = new Car("Toyota", "Red", "Corolla");

// const car2 = new Car("BMW", "Black", "X5");

// console.log(car1);
// console.log(car2);

class student{

    constructor(Name,Age,Course){
          this.Name = Name
          this.Age = Age
          this.Course= Course
    }

    isStudy(){
      console.log("He is studing")
    }

    displayInfo(){
        console.log(`This is student info: ${this.Name},${this.Age} and ${this.Course}`)
    }
}

const student1= new student ("Gedeon",23,"English")
const student2 = new student ("Gada",12,"Math")

student1.displayInfo()
student1.isStudy()

student2.displayInfo()
student2.isStudy()



class calculator{
    constructor(a,b){}
}
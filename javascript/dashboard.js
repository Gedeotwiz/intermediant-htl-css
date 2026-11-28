

//  function displayTodos() {
//   fetch('https://dummyjson.com/products')
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP Error: ${response.status}`);
//       }

//       return response.json();
//     })
//     .then((data) => {
//       console.log('All products:', data);
//     })
//     .catch((error) => {
//       console.error('Failed to fetch products:', error.message);
//     });
// }


// async function displayTodos() {
//   const response = await fetch('https://dummyjson.com/products');
//   const data = await response.json();

//   console.log(data);
// }

// displayTodos();


async function displayOneTodo(){
    const response = await fetch('https://dummyjson.com/products/1');
    const data = await response.json();
    console.log(data);
}

displayOneTodo()


function getUsers() {
    return new Promise((resolve, reject) => {

        fetch('https://dummyjson.com/users')
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`HTTP Error: ${response.status}`));
                    return;
                }

                return response.json();
            })
            .then(data => {
                if (data) {
                    resolve(data);
                }
            })
            .catch(error => {
                reject(error);
            });

    });
}

getUsers()
    .then(users => {
        console.log('All users:', users);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
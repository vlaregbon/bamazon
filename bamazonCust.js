var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

user:"root",
password:"triple888",
database:"bamazon_db"
});

connection.connect(function(err){
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

// function afterConnection() {
//   connection.query("SELECT * FROM products", function(err, res) {
//     if (err) throw err;
//     start()
//   });
// }

function start() {
  connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  inquirer
    .prompt([
     {
      name: "choice",
      type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < res.length; i++) {
              choiceArray.push(res[i].productName + " - $" + res[i].price);
            }
            return choiceArray;
          },
      message:"What Product do you want to buy?"
     },
     {
       name: "quantity",
       type: "input",
       message: "How many do you want"
     },
    ]).then(function(answer){
      var chosenItem;
      for (var i=0; i < res.length; i++){
        if (res[i].productName === answer.choice)
        {
          chosenItem = res[i];
        }
      }
      if (chosenItem.stock > parseInt(answer.quantity))
      {
        connection.query("UPDATE products SET ? WHERE ?",[
         {
           stock: chosenItem.stock - parseInt(answer.quantity),
           sales: chosenItem.price*parseInt(answer.quantity)
         },
         {
           item_id:chosenItem.item_id,
         } 
        ],
        function(err){
          if(err) throw err;
          console.log("You Got "+ parseInt(answer.quantity)+" "+ answer.choice + "!");
            console.log ("Your total is $"+(chosenItem.price*answer.quantity)+"!")
            console.log (" ");
        start();
        }
      );
    }

     else {
       console.log ("Sorry!, we only have "+chosenItem.stock+" in stock!")
       start();
     }
    });
  
  });  
}
let express = require("express") // express framework import garne
let app = express() // express framework ko instance create garne

app.set("view engine","ejs") // ejs ko view engine set garne
require("./model/index") // importing the database connection file

app.get("/",(req,res)=>{ // home.ejs or home
      res.render("home")  // home.ejs file ko content lai render garnexa 
})

app.listen(3000, ()=>{ // server run on port 3000
console.log("Project has started at port 3000") // server run on port 3000
})



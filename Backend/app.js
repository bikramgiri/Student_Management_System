let express = require("express")
let app = express()
app.set("view engine","ejs") 

app.get("/",(req,res)=>{ // home.ejs or home
      res.render("home")  // home.ejs file ko content lai render garnexa 
})

app.listen(3000, ()=>{
console.log("Project has started at port 3000")
})



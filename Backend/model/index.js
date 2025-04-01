const {Sequelize, DataTypes} = require('sequelize') // sequelize, and datatypes are imported from sequelize

const sequelize = new Sequelize ('Student Management System','root','',{ //database name, username, password)
    host:'localhost', // database ko host
    port:3306, // database ko port number
    dialect:'mysql', // database ko dialect (mysql, postgres, sqlite, mssql)
    operatorsAliases: false, // sequelize ko operators ko alias
    pool:{ // connection pool ko configuration
        max:5, // maximum number of connection pool
        min:0, // minimum number of connection pool
        acquire:30000, // maximum time (in ms) to try to connect before throwing error
        idle:10000 // maximum time (in ms) that a connection can be idle before being released
    }
}) 

sequelize.authenticate().then(()=>{ // database ko connection check garne
    console.log("Database connected successfully")
}).catch((err)=>{
    console.log("Error connecting to database", err)
})

const db = {} // empty object
db.Sequelize = Sequelize // add sequelize class to db object
db.sequelize = sequelize // add sequelize instance to db object

db.sequelize.sync({force:false}).then(()=>{ // sync the database with the models
    console.log("Database synced successfully") // sync the database with the models
}).catch((err)=>{ // sync the database with the models
    console.log("Error syncing database", err) // sync the database with the models
})

module.exports = db // export the db object so that it can be used in other files


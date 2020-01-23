const express = require('express');
const employeeRoutes = require('./routes/employee');
const app = express();
const port = parseInt(process.env.PORT || '3000');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use((req,res,next) => {
    //The angular FE is running at port 4200 and node app is running at 3000.
    //This results in CORS error. This is to resolve that.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers","Origin,X_Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS,PATCH");
    next();
});

//Use the routes defined in employee.js
app.use('/api/employees', employeeRoutes);

// Send error in case of failure
app.use(function(req, res) {
    res.status(404).send('Not found');
});

// serever listens on the specified port
app.listen(port, function() {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;

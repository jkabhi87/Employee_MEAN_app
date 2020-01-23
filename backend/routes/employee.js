'use strict';

const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const util = require('util');
require('util.promisify').shim();
const request = util.promisify(require('request'));


//We will use mongoose to connect to mongoDB, where we will be persisting our data.
mongoose.connect('mongodb://localhost:27017/employees');

//Mongoose schema for the Employee collection
var Employee = mongoose.model('Employee', mongoose.Schema({
	firstName:String,
	lastName:String,
	hireDate: String,
  role: String,
  favoriteJoke: String,
  favoriteQuote: String
}));

//URLs to get random quote and joke
const RANDOM_QUOTE_URL = 'https://ron-swanson-quotes.herokuapp.com/v2/quotes';
const RANDOM_JOKE_URL = 'https://icanhazdadjoke.com';

//In case of failure, we will use the default values of joke and quote
const DEFAULT_JOKE = "Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love me.";
const DEFAULT_QUOTE = "Well, well, well, how the turntables.";

//Whenever the post body validation fails, we will send this error back.
//Scenarios like missing fields, improper roles, hireDate format mismatch etc.,
const POST_BODY_ERROR = {
    error: 'Post body error',
    details: 'Mandatory fields: firstName, lastName, hireDate (YYYY-MM-DD format earlier than current date), role [CEO (only once), VP, MANAGER, or LACKEY]'
};

//regular expression for validating date in yyyy-mm-dd
const DATE_REGEX = /([12]\d{3}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;

// GET all employees
router.get('', function(req, res) {
  Employee.find(function(err, employees){
		if(err)
			res.send(err);
		res.json(employees);
	});
});

// GET employee with a specific id
router.get('/:id', function(req, res) {
  //Lookup the id in the mongo collection. If found, send the object
  Employee.findOne({_id:req.params.id}, function(err, employee){
		if(err)
			res.send(err);
		res.json(employee);
	});
});

// POST endpoint to create a new employee
router.post('', async function(req, res) {
  //Before starting, check if all the fields provided are of valid types, formats and values
    var validBody = await isValidBody(req.body);
    if (!validBody) {
        return res.status(400).send(POST_BODY_ERROR);
    }
    //If checks pass, then get the random quote and joke from the endpoints and create the employee record
    Promise.all([getRandomJoke(), getRandomQuote()])
                  .then(([joke, quote]) => {
                    //If the user has not entered a joke, then assign random joke
                    if(!req.body.favoriteJoke){
                      req.body.favoriteJoke = joke;
                    }
                    //If the user has not entered a quote, then assign random quote
                    if(!req.body.favoriteQuote){
                      req.body.favoriteQuote = quote;
                    }
                    //Create the employee record
                    Employee.create( req.body, function(err, employees){
                      if(err){
                        res.send(err);
                      }
                      res.json(employees);
                    });
                  })
                  .catch(() => {
                    //If the calls to random joke or random quote fails, use the default ones
                    req.body.favoriteJoke = DEFAULT_JOKE;
                    req.body.favoriteQuote = DEFAULT_QUOTE;
                    Employee.create( req.body, function(err, employees){
                      if(err){
                        res.send(err);
                      }
                      res.json(employees);
                    });
      });
});

/* PUT a new employee record */
router.put('/:id', async function(req, res) {
  //Before starting the update, check if all the fields are of valid types, formats and values
  var validBody = await isValidBody(req.body);
  if (!validBody) {
    return res.status(400).send(POST_BODY_ERROR);
}
  var query = {
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		hireDate:req.body.hireDate,
  	role:req.body.role,
  	favoriteJoke: req.body.favoriteJoke,
  	favoriteQuote: req.body.favoriteQuote
  };
  //update the record
	Employee.findOneAndUpdate({_id:req.params.id}, query, function(err, employee){
		if(err)
			res.send(err);
    res.json(query);
	});
});

// DELETE an employee record
router.delete('/:id', function(req, res) {
  //Lookup and delete the record
  Employee.findOneAndRemove({_id:req.params.id}, function(err, employee){
		if(err)
			res.send(err);
		res.json(employee._id);
	});
});

//Function to get the random joke
function getRandomJoke() {
    return request(RANDOM_JOKE_URL, {json: true})
      .then((result) => {
          return result.body.joke;
      });
}

//Function to get the random quote
function getRandomQuote() {
    return request(RANDOM_QUOTE_URL, {json: true})
      .then(result => {
          return result.body[0];
      });
}

/*
 * This function checks if all the mandatory fields are entered.
 * If their values are of the right type.
 * If the role entered is valid. If the role is "CEO", then it also checks if there are other CEO records in the database.
 * If the hireDate is of valid format and value.
 */
async function isValidBody(body) {
    //using await to make sure that the methods doen't return prior to ceoExists and isValidHireDate functions.
    var ceo_exists = await ceoExists();
    var date_valid = await isValidHireDate(body.hireDate);
    //Checking the validity of the fields one by one
    if (!body || !body.firstName || typeof body.firstName !== 'string'
      || !body.lastName || typeof body.lastName !== 'string'
      || !body.hireDate || typeof body.hireDate !== 'string'
      || !body.role || typeof body.role !== 'string'
      || !isValidRole(body.role) || ((body.role === 'CEO') && ceo_exists)
      || !date_valid
    ) {
      //If any of the condition holds, then the body is not valid, return false
      console.log("returning false for valid body");
        return false;
    }
    console.log("returning true for valid body");
    return true;
}

//Function to check the DB to find if there are already documents with "CEO" as role.
async function ceoExists() {
  var emps = await Employee.find({role:"CEO"});
    console.log("Employee list:");
    console.log(emps);
    //If the resultSet is not empty, then there are CEO records in the database
		if(emps.length === 0){
      return false;
    }
    return true;
}

//This function checks if the hireDate is in YYYY-MM-DD format and that it isn't in future
async function isValidHireDate(date) {
  //Check if the date matches the date regex
  if (!date.match(DATE_REGEX)) {
    return false;
 }
 //Now, compare the date passed with the current date to make sure it is not in the future
  let passed_date = new Date(date);
  let today = new Date();

  if (passed_date > today) {
      return false;
  }
  return true;
};

//Function to check if the role entered is valid
function isValidRole(role) {
    //Role entered has to be within the list provided
    let role_list = ["CEO","VP","MANAGER","LACKEY"];
    return (role_list.indexOf(role) > -1);
}

module.exports = router;

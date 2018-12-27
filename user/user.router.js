const express = require('express');
const Joi = require('joi');
const bodyParser = require('body-parser');


const jsonParser = bodyParser.json();

const { User, UserJoiSchema } = require('./user.model.js');

const userRouter = express.Router();

//Creates new user
userRouter.post('/', (req, res) => {
    const newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    };

    //Validate new user information against joi schema
    const validation = Joi.validate(newUser, UserJoiSchema);
    if (validation.error) {
        console.log("joi validation errors");
        return response.status(400).json({ error: validation.error });
    }


    //Validate that there is not an existing account with either the provided email or username in MongoDB Step 
    User.findOne({
        $or: [
            { email: newUser.email },
            { username: newUser.username }
        ]
    }).then(user => {
        if (user) {
            //if existing email or username found - return status code and error message
            const error = new Error('A user with that username and/or email already exists. Please try again.');
            error.status = 400;
            return Promise.reject(error);
        }
        //If no username/email conflict - hash entered password
        return User.hashPassword(newUser.password);

    }).then(passwordHash => {
        newUser.password = passwordHash;
        //create new user in mongodb
        User.create(newUser)
            .then(createdUser => {
                //if successful - return newly created user info 
                return res.status(201).json(createdUser.serialize());
            })
            .catch(err => {
                //if error with creating new user - return HTTP status code and error
                err.status = 500;
                console.error(err.message);
                return Promise.reject(err);
            });
    })
    .catch(err => {
            return res.status(err.status).json({ error: err.message });
        })
});


//Get all users
userRouter.get('/', (req, res) => {
    //Retrieve all users from mongoDb Step 1: Attempt to retrieve all users from the database using Mongoose.Model.find()
    User.find()
        .then(users => {
            //Return formatted users from serialized method and HTTP status code 
            return res.status(200).json(
                users.map(user => user.serialize())
            );
        })
        .catch(err => {
            //If error - return HTTP status code and error
            return res.status(500).json(err);
        });
});

//Get user by id
userRouter.get('/:userid', (req, res) => {
    //Retrieve specific user from database
    User.findById(req.params.userid)
        .then(user => {
            //If user id found - return status code and serialized user data
            return res.status(200).json(user.serialize());
        })
        .catch(error => {
            //If error - return HTTP status code and error
            return res.status(500).json(error);
        });
});

module.exports = { userRouter };
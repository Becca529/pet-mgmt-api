const express = require("express");
const Joi = require('joi');
const sittersRouter = express.Router();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const passport = require('passport');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.Promise = global.Promise;
const { Pet, petJoiSchema } = require('../models/petsModel.js');
const { jwtStrategy } = require('../auth/auth.strategy');

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });


// -----------------------------------------------------------------------------
//                                    POST
// -----------------------------------------------------------------------------
sittersRouter.post('/:petId', jsonParser, jwtAuth, (req, res) => {
    Pet.findById(req.params.petId)
    .then(pet => {
      pet.petSittingData.push({ 
        foodType: req.body.foodType,
        quantity: req.body.quantity,
        frequency: req.body.frequency,
      })
    pet.save()
    })
    .then(() => {
      console.log('vet info added');
      return res.status(201).end();
    })
    .catch(err => {
      console.log(err)
      return res.status(500).json(err);
})
});

// -----------------------------------------------------------------------------
//                                    DELETE
// -----------------------------------------------------------------------------
sittersRouter.delete('/:petId/:subDocId', jwtAuth, (req, res) => {
    let subDocId = req.params.subDocId;
    let petId = req.params.petId;
    console.log("getting to delete");
    Pet.findById(petId)
       
    .then(pet => {
        return Pet.findByIdAndUpdate(pet._id, {
            '$pull' : {'petSittingData': {'_id': new ObjectId(subDocId)}}
          })
        })
});

// -----------------------------------------------------------------------------
//                                    PUT
// -----------------------------------------------------------------------------
sittersRouter.put('/:petId/:subDocId', jwtAuth, (req, res) => {
    let subDocId = req.params.subDocId;
    let petId = req.params.petId;
    console.log("getting to delete");
    Pet.findById(petId)
    .then(pet => {
        return Pet.findByIdAndUpdate(pet._id, {
            '$set' : {'petSittingData': {'_id': new ObjectId(subDocId)}}
          })
        })
});


module.exports = { sittersRouter };
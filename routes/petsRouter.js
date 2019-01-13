const express = require("express");
const Joi = require('joi');
const petsRouter = express.Router();

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
//                                    DELETE
// -----------------------------------------------------------------------------
petsRouter.delete('/:petid', jsonParser, jwtAuth, (req, res) => {
  Pet.findByIdAndDelete(req.params.petid)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});


// -----------------------------------------------------------------------------
//                                    GET ALL
// -----------------------------------------------------------------------------
petsRouter.get('/',jsonParser, jwtAuth, (req, res) => {
  Pet.find({ user: req.user.id })
    .populate('user')
    .then(pets => {
      return res.status(200).json(
           pets.map(pet => pet.serialize())
         );;
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});


// -----------------------------------------------------------------------------
//                                  GET SINGLE
// -----------------------------------------------------------------------------
// Retrieve one pet profile by id
petsRouter.get('/:petID', jsonParser, jwtAuth, (req, res) => {
  Pet.findById(req.params.petID)
    .populate('user')
    .then(pet => {
      return res.status(200).json(pet.serialize());
    })
    .catch(err => {
      return res.status(500).json(err);

    });
});


// -----------------------------------------------------------------------------
//                                     POST
// -----------------------------------------------------------------------------
petsRouter.post('/', jsonParser, jwtAuth, (req, res) => {
  console.log(req.user);
  const newPet = {
    user: req.user.id,
    petName: req.body.petName,
    type: req.body.type,
    breed: req.body.breed,
    sex: req.body.sex,
    birthdate: req.body.birthdate,
    personality: req.body.personality,
    likes: req.body.likes,
    dislikes: req.body.dislikes,
    weight: req.body.weight,
    physicalDescription: req.body.physicalDescription
  };

  // Checks that all provided data passes all schema requirements
  const validation = Joi.validate(newPet, petJoiSchema);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  Pet.create(newPet)
    .then(createdPet => {
      return res.status(201).json(createdPet.serialize());
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});



// -----------------------------------------------------------------------------
//                                      PUT
// -----------------------------------------------------------------------------
petsRouter.put('/:petid', jsonParser, jwtAuth, (req, res) => {
  const updatedPet = {
    user: req.user.id,
    petName: req.body.petName,
    type: req.body.type,
    breed: req.body.breed,
    sex: req.body.sex,
    birthdate: req.body.birthdate,
    personality: req.body.personality,
    likes: req.body.likes,
    dislikes: req.body.dislikes,
    weight: req.body.weight,
    physicalDescription: req.body.physicalDescription
  };
  console.log(updatedPet);
  console.log(req.params.petid);
  // Checks that all provided data passes all schema requirements
  const validation = Joi.validate(updatedPet, petJoiSchema);
  if (validation.error) {
    console.log("validation");
    return res.status(400).json({ error: validation.error });
  }
  console.log("no validation issue");
  // Looks for idea by id, if found, updates info
  Pet.findByIdAndUpdate(req.params.petid, updatedPet)
    .then(() => {
      console.log("update");
      return res.status(201).end();
    })
    .catch(err => {
      console.log("here");
      return res.status(500).json(err)
    });
});

module.exports = { petsRouter };

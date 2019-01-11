const express = require("express");
const Joi = require('joi');
const vaccinesRouter = express.Router();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const passport = require('passport');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.Promise = global.Promise;
const { Pet, petJoiSchema } = require('../pet-profile/pet.model');
const { jwtStrategy } = require('../auth/auth.strategy');

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });


vaccinesRouter.post('/:petId/vaccine', jsonParser, jwtAuth, (req, res) => {
    Pet.findById(req.params.petId)
        .then(pet => {
          pet.vaccineData.push({ 
            vaccineName: req.body.vaccineName,
            dateAdministered: req.body.dateAdministered,
            notes: req.body.notes,
            nextDueDate: req.body.nextDueDate
          })
        pet.save()
        })
        .then(() => {
          console.log('vaccine-added');
          return res.status(201).end();
        })
        .catch(err => {
          console.log(err)
          return res.status(500).json(err);
})
});


vaccinesRouter.delete('/:petId/vaccine/:subDocId', jwtAuth, (req, res) => {
    let subDocId = req.params.subDocId;
    let petId = req.params.petId;
    console.log("getting to delete");
    Pet.findById(petId)
        // .then(pet => {
        //   if (pet.user._id !== req.user._id) {
        //     //throw errorr - catch error here
        //   }
    .then(pet => {
        return Pet.findByIdAndUpdate(pet._id, {
            '$pull' : {'vaccineData': {'_id': new ObjectId(subDocId)}}
          })
        })
});

vaccinesRouter.put('/:petId/vaccine/:subDocId', jwtAuth, (req, res) => {
    let subDocId = req.params.subDocId;
    let petId = req.params.petId;
    console.log("getting to delete");
    Pet.findById(petId)
        // .then(pet => {
        //   if (pet.user._id !== req.user._id) {
        //     //throw errorr - catch error here
        //   }
    .then(pet => {
        return Pet.findByIdAndUpdate(pet._id, {
            '$set' : {'vaccineData': {'_id': new ObjectId(subDocId)}}
          })
        })
});




module.exports = { vaccinesRouter };
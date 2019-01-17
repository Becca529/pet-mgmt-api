const express = require("express");
const Joi = require("joi");
const veterinariansRouter = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const passport = require("passport");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
mongoose.Promise = global.Promise;
const { Pet, petJoiSchema } = require("../models/petsModel.js");
const { jwtStrategy } = require("../auth/auth.strategy");

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate("jwt", { session: false });

// -----------------------------------------------------------------------------
//                                    POST
// -----------------------------------------------------------------------------
veterinariansRouter.post("/:petId", jsonParser, jwtAuth, (req, res) => {
  console.log("getting to post vet");
  Pet.findById(req.params.petId)
    .then(pet => {
      pet.vetData.push({
        clinicName: req.body.clinicName,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        zipCode: req.body.zipCode,
        city: req.body.city,
        state: req.body.state,
        phoneNumber: req.body.phoneNumber,
        faxNumber: req.body.faxNumber,
        email: req.body.email,
        doctor: req.body.doctor
      });
      pet.save();
    })
    .then(() => {
      console.log("vet info added");
      return res.status(201).end();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});

// -----------------------------------------------------------------------------
//                                    DELETE
// -----------------------------------------------------------------------------
veterinariansRouter.delete("/:petId/:subDocId", jwtAuth, (req, res) => {
  console.log("getting to delete");
  let petId = req.params.petId;
  let subDocId = req.params.subDocId;
  Pet.findById(petId)
    .then(pet => {
      return Pet.findByIdAndUpdate(pet._id, {
        $pull: { vetData: { _id: new ObjectId(subDocId) } }
      });
    })
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

// -----------------------------------------------------------------------------
//                                    PUT
// -----------------------------------------------------------------------------
veterinariansRouter.put("/:petId/:subDocId", jwtAuth, (req, res) => {
  let subDocId = req.params.subDocId;
  let petId = req.params.petId;
  console.log("getting to put router");

  Pet.updateOne(
    {
      _id: petId,
      "vetData._id": new ObjectId(subDocId)
    },
    {
      $set: {
        "vetData.$.clinicName": req.body.clinicName
      }
    }
  )
    .then(pet => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

module.exports = { veterinariansRouter };

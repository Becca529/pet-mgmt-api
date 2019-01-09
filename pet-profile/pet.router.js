
const express = require("express");
const Joi = require('joi');
const petRouter = express.Router();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const passport = require('passport');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.Promise = global.Promise;
const { Pet, petJoiSchema } = require('./pet.model.js');
const { jwtStrategy } = require('../auth/auth.strategy');

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });


// // Get user pet profiles
// petRouter.get('/', jsonParser, jwtAuth, (req, res) => {
//   console.log(req.user);
//   Pet.find({ user: req.user.id })
//     .populate('user')
//     .then(pet => {
//       return res.status(200).json(
//         pets.map(idea => pet.serialize())
//       );
//     })
//     .catch(err => {
//       return res.status(500).json(err);
//     });
// });


//Create a new pet profile
petRouter.post('/', jsonParser, jwtAuth, (req, res) => {
  console.log(req.user);
  console.log("gettting to post router");
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

  // Creates a new instance of pet profile
  Pet.create(newPet)
    .then(createdPet => {
      return res.status(201).json(createdPet.serialize());
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
});

// Update pet profile by id
petRouter.put('/:petid', jwtAuth, (req, res) => {
  const updatedPet = {
    user: req.user.id,
    petid: req.body.id,
    petName: req.body.petName,
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
      return res.status(204).end();
    })
    .catch(err => {
      console.log("here");
      return res.status(500).json(err)
    });
});

// Retrieve user pet profiles
petRouter.get('/',jsonParser, jwtAuth, (req, res) => {
  Pet.find()
    .exec()
    // .populate('user')
    .then(pets => {
      // return res.status(200).json(
      //   pets.map(pet => pet.serialize())
      // );
      return res.status(200).json(
           pets.map(pet => pet.serialize())
         );;
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});



// Retrieve one pet profile by id
petRouter.get('/:petID', jsonParser, (req, res) => {
  Pet.findById(req.params.petID)
    .populate('user')
    .then(pet => {
      return res.status(200).json(pet.serialize());
    })
    .catch(err => {
      return res.status(500).json(err);

    });
});

// Remove pet profile by id
petRouter.delete('/:petid', jsonParser, (req, res) => {
  Pet.findByIdAndDelete(req.params.petid)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});


///PET PROFILE SUBDOCUMENTS - VET, PETTING-SITTING-FOOD, VACCINE

//ADD NEW
petRouter.post('/:petId', jsonParser, (req, res) => {
  if (!req.body.type) {
    console.log('missing correct subdocument type');
    return res.status(400).end
  }

  if (req.body.type == 'vaccine') {
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
}

  if(req.body.type == 'pet-sitting-food') {
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
        console.log('pet-sitting food added');
        return res.status(201).end();
      })
      .catch(err => {
        console.log(err)
        return res.status(500).json(err);
  })
  }

  if(req.body.type == 'vet') {
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
          doctor: req.body.doctor,
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
}
  else  {
    console.log('incorrect subdocument type');
    return res.status(400).end
  }
  });
  
//DELETE
petRouter.delete('details/${subdDocId}', jsonParser, (req, res) => {
  if (!req.body.type) {
    console.log('missing correct subdocument type');
    return res.status(400).end
  }
});
  // if(req.body.type === 'vet') {
  //   Pet.find({ "vetData._id": req.query.subDocId})
  //     .then (item => {
  //       $pull.item
  //     }


  //     .then(pet => {
  //     $pull: { subPages: { _id: req.body.ID } }
  // }


  // if (!req.body.type) {
  //   console.log('missing correct subdocument type');
  //   return res.status(400).end
  // }
  // else {

  // }

  //UPDATE
  petRouter.put('/:petId', jsonParser, (req, res) => {
    if (!req.body.type) {
      console.log('missing correct subdocument type');
      return res.status(400).end
    }
  
    if (req.body.type === 'vaccine') {
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
  
    if(req.body.type === 'pet-sitting-food') {
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
          console.log('pet-sitting food added');
          return res.status(201).end();
        })
        .catch(err => {
          console.log(err)
          return res.status(500).json(err);
    })
    }
  
    if(req.body.type === 'vet') {
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
            doctor: req.body.doctor,
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
    }
  }
    else  {
      console.log('incorrect subdocument type');
      return res.status(400).end
    }
  });
  
  //***** MEDICIAL ********
//get all medical-vaccinces by pet id
//get all medical-medicine by pet id
//post new medical-vaccinces
//post new medical-medicine
//edit medical-vaccinces
//edit medical-medicine
//delete by subdocument ID

//***** PETSITTING DETAILS ********
//get petsitting food details by pet id
//get all petsitinng - notes by pet id
//post new food
//post new note
//edit food
//edit note
//delete by subdocument ID

//***** VET DETAILS ********
//get vet info my pet id
//post new vet
//edit vet info
//delete by subdocument ID

module.exports = { petRouter };
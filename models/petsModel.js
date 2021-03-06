const mongoose = require('mongoose');
const Joi = require('joi');

const vetSchema = mongoose.Schema({
  clinicName: 'string',
  addressLine1: 'string',
  addressLine2: 'string',
  city: 'string',
  zipCode: 'string',
  state: 'string',
  phoneNumber: 'string',
  faxNumber: 'string',
  email: 'string',
  doctor: 'string',
  emergencyAfterHours: 'string'
})

const medicineSchema = mongoose.Schema({
  medicineName: 'string',
  description: 'string',
  directions: 'string',
  rxNumber: 'string',
  prescribingVet: 'string',
})

const vaccineSchema = mongoose.Schema({
  vaccineName: 'string',
  dateAdministered: { type: Date},
  notes: 'string',
  nextDueDate: { type: Date},
})

const notesSchema = mongoose.Schema({
  noteName: 'string',
  note: 'string',
  type: 'string',
  createDate: type = Date,
 });

const petSittingSchema = mongoose.Schema({
  food: {
      foodType: 'string',
      quantity: 'string',
      frequency: 'string',
      notes: 'string'
  },
  notes: [notesSchema]
})



//Create mongoose pet schema
const petSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  petName: { type: String, required: true },
  //photo: {type: Image},
  type: 'string',
  breed: 'string',
  sex: 'string',
  personality: 'string',
  likes: 'string',
  dislikes: 'string',
  physicalDescription: 'string',
  weight: { type: Number },
  vetData: [vetSchema],
  medicineData: [medicineSchema],
  vaccineData: [vaccineSchema],
  petSittingData: [petSittingSchema]
});



//Serialize pet function
petSchema.methods.serialize = function () {
  let user;
  if (typeof user === 'function') {
    user = this.user.serialize();
  } else {
    user = this.user;
  }
  return {
    id: this._id,
    user: user,
    petName: this.petName,
    type: this.type,
    breed: this.breed,
    sex: this.sex,
    physicalDescription: this.physicalDescription,
    likes: this.likes,
    personality: this.personality,
    dislikes: this.dislikes,
    weight: this.weight,
    createDate: this._id.getTimestamp().toLocaleDateString(),
    vetData: this.vetData,
    vaccineData: this.vaccineData,
    petSittingData: this.petSittingData
  };
};


// Validate provided data when creating a new pet profile
const petJoiSchema = Joi.object().keys({
  user: Joi.string().optional(),
  petName: Joi.string().min(1).trim().required(),
  breed: Joi.string().allow('', null),
  sex: Joi.string().allow('', null),
  personality: Joi.string().allow('', null),
  type: Joi.string().allow('', null),
  likes: Joi.string().allow('', null),
  dislikes: Joi.string().allow('', null),
  weight: Joi.number().allow('', null),
  physicalDescription: Joi.string().min(1).max(500).trim().allow('', null)
});




const Pet = mongoose.model('pet', petSchema);
module.exports = { Pet, petJoiSchema };

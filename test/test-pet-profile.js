const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jsonwebtoken = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, TEST_DATABASE_URL } = require('../config');
const { startServer, stopServer, app } = require('../server');
const { User } = require('../models/usersModel');
const { Pet } = require('../models/petsModel');

const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for api/pets', function () {
  let testUser, jwToken;

  before(function () {
    return startServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    testUser = generateUserData();

    return User.hashPassword(testUser.password)
      .then(hashedPassword => {
        return User.create({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          username: testUser.username,
          email: testUser.email,
          password: hashedPassword
        })
          .catch(err => {
            throw new Error(err);
          });
      })
      .then(createdUser => {
        testUser.id = createdUser.id;
        jwToken = jsonwebtoken.sign(
          {
            user: {
              id: testUser.id,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              email: testUser.email,
              username: testUser.username
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRY,
            subject: testUser.username
          }
        );
        //Create new pet
        const seedData = [];
        for (let i = 1; i <= 10; i++) {
          const newPet = generatePetData();
          newPet.user = createdUser.id;
          seedData.push(newPet);
        }
        return Pet.insertMany(seedData)
          .catch(err => {
            console.error(err);
            throw new Error(err);
          });
      });
  });

  afterEach(function () {
    return new Promise((resolve, reject) => {
      mongoose.connection.dropDatabase()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  });

  after(function () {
    return stopServer();
  })

  it('should return user pets', function () {
    return chai.request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${jwToken}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.lengthOf.at.least(1);
        const pet = res.body[0];
        expect(pet).to.include.keys('petName');
        expect(pet.user).to.be.a('object');
        expect(pet.user).to.include.keys('firstName', 'lastName', 'username');
      })
  });

  it('should return a specific pet', function () {
    let searchPet;
    return Pet.find()
      .then(pets => {
        expect(pets).to.be.a('array');
        expect(pets).to.have.lengthOf.at.least(1);
        searchPet = pets[0];

        return chai.request(app)
          .get(`/api/pets/${searchPet.id}`)
          .set('Authorization', `Bearer ${jwToken}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('petName', 'type', 'breed', 'sex', 'birthdate', 'personality', 'likes', 'dislikes', 'weight', 'physicalDescription');
        expect(res.body).to.deep.include({
          id: searchPet.id,
          petName: searchPet.petName
        });
      });
  });


  it('should update pet details', function () {
    let petToUpdate;
    const newPetData = generatePetData();
    return Pet.find()
      .then(pets => {
        expect(pets).to.be.a('array');
        expect(pets).to.have.lengthOf.at.least(1);
        petToUpdate = pets[0];

        return chai.request(app)
          .put(`/api/pets/${petToUpdate.id}`)
          .set('Authorization', `Bearer ${jwToken}`)
          .send(newPetData)
      })
      .then(res => {
        expect(res).to.have.status(204);
      });
  });

  it('should delete an user pet', function () {
    let petToDelete;
    return Pet.find()
      .then(pets => {
        expect(pets).to.be.a('array');
        expect(pets).to.have.lengthOf.at.least(1);
        petToDelete = pets[0];

        return chai.request(app)
          .delete(`/api/pets/${petToDelete.id}`)
          .set('Authorization', `Bearer ${jwToken}`);
      })
      .then(res => {
        expect(res).to.have.status(204);

        return Pet.findById(petToDelete.id);
      })
      .then(pet => {
        expect(pet).to.not.exist;
      });
  });

  // Generates a User object
  function generateUserData() {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: `${faker.lorem.word()}${faker.random.number(100)}`,
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  }

  // Generates a Pet object
  function generatePetData() {
    return {
      petName: faker.name.firstName(),
      type: faker.lorem.word(),
      breed: faker.lorem.word(),
      sex: faker.lorem.word(),
      birthdate: faker.date.recent(),
      personality: faker.lorem.word(),
      likes: faker.lorem.word(),
      dislikes: faker.lorem.word(),
      weight: faker.random.number(100),
      physicalDescription: faker.lorem.sentence()
    };
  }
});


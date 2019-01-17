const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const { app, startServer, stopServer } = require('../server');
const { User } = require('../models/usersModel');
const { TEST_DATABASE_URL } = require('../config');
const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for /api/users', function () {
  let testUser;

  before(function () {
    return startServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    testUser = generateUserData();

    return User.create(testUser)
      .then(() => { })
      .catch(err => {
        console.error(err);
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
  });


  it('should return all users', function () {
    return chai.request(app)
      .get('/api/users')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        expect(res.body[0]).to.include.keys('id', 'firstName', 'lastName', 'email', 'username')
        expect(res.body[0]).to.not.include.keys('password');

      });
  });

  it('should return a specific user', function () {
    let searchUser;
    return chai.request(app)
      .get('/api/users')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        searchUser = res.body[0];
        return chai.request(app).get(`/api/users/${searchUser.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.id).to.equal(searchUser.id);
      });
  });

  it('should create a new user', function () {
    let newUser = generateUserData();
    return chai.request(app)
      .post('/api/users')
      .send(newUser)
      .then(res => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object')
        expect(res.body).to.include.keys('id', 'username', 'firstName', 'lastName', 'email');
        expect(res.body.firstName).to.equal(newUser.firstName);
        expect(res.body.lastName).to.equal(newUser.lastName);
        expect(res.body.email).to.equal(newUser.email);
        expect(res.body.username).to.equal(newUser.username);
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
});
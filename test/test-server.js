const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, startServer, stopServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for /', function () {
  before(function () {
    return startServer(TEST_DATABASE_URL);
  });

  after(function () {
    return stopServer();
  });

  it('should run index.html', function () {
    chai.request(app)
      .get('/')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      })
  });
});
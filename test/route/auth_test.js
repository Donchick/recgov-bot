const request = require('supertest');
const userStorage = require('../../storage/userStorage');
const app = require('../../app');
const expect = require('chai').expect;
const sinon = require('sinon');


describe('auth route tests', () => {
  it('registers user', (done) => {
    const mock = sinon.mock(userStorage);

    const body = {
      login: '123@gmail.com',
      password: 'abc',
      notificationClients: [{resource: 'whatsapp', path: '+14154120073'}],
    };

    mock.expects("addUser").once().withArgs(body.login, body.password, body.notificationClients);

    request(app)
        .post('/api/auth/register')
        .set('Accept', 'application/json')
        .send(body)
        .expect(200)
        .then((res) => {
          mock.verify();
          done();
        });
  });
});
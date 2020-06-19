const request = require('supertest');
const SubscribeController = require('../../controller/subscribe');
const expect = require('chai').expect;
const sinon = require('sinon');

const app = require('../../app');

describe('POST /subscribe', function() {
  it('subscribes user by valid subscription', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-027"],
      }, {
        campId: 2,
        dates: ["2020-06-25", "2020-06-26", "2020-06-027"],
      }],
    };

    mock.expects("subscribe").once().withArgs(subscriber);

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(200)
        .then(() => {
          mock.verify();
          done();
        });
  });

  it('returns error with empty subscriber', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send()
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['empty-subscriber-body']);
          done();
        });
  });

  it('returns error with undefined notify client', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-027"],
      }, {
        campId: 2,
        dates: ["2020-06-25", "2020-06-26", "2020-06-027"],
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['empty-notify-client']);
          done();
        });
  });

  it('returns error with unknown notify client', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'UNKNOWN',
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-027"],
      }, {
        campId: 2,
        dates: ["2020-06-25", "2020-06-26", "2020-06-027"],
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['unknown-notify-client']);
          done();
        });
  });

  it('returns error with undefined user', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-027"],
      }, {
        campId: 2,
        dates: ["2020-06-25", "2020-06-26", "2020-06-027"],
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['undefined-user']);
          done();
        });
  });

  it('returns error with undefined camps list', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['empty-camp-list']);
          done();
        });
  });

  it('returns error with empty camps list', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['empty-camp-list']);
          done();
        });
  });

  it('returns error with invalid camp id', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        dates: ['2020-05-25'],
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['unknown-camp-id']);
          done();
        });
  });

  it('returns error with undefined camp dates', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 123,
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['unknown-dates']);
          done();
        });
  });

  it('returns error with invalid camp dates', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 123,
        dates: ['05-25-2020', '2020-05-26'],
      }],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['invalid-date-format']);
          done();
        });
  });

  it('returns error with too many camps', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    const subscriber = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{}, {}, {}, {}, {}],
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.deep.equal(['camp-list-contains-to-many-elements']);
          done();
        });
  });

  it('returns error with bunch of reasons', (done) => {
    var spy = sinon.spy();
    var mock = sinon.mock(SubscribeController);
    mock.expects("subscribe").never();

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: {}})
        .expect(500)
        .then((res) => {
          mock.verify();
          expect(res.body.type).to.equal('invalid-argument');
          expect(res.body.errors).to.have.members(['undefined-user', 'empty-notify-client', 'empty-camp-list']);
          done();
        });
  });
});
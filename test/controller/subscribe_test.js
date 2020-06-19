const SubscribeController = require('../../controller/subscribe');
const subscriptionStorage = require('../../storage/subscriptionStorage');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Subscribe controller test', () => {
  beforeEach(() => {
    this.underTest = SubscribeController;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('calls add method of subscriptionStorage', () => {
    const spy = sinon.spy();
    const mock = sinon.mock(subscriptionStorage);
    const subscription = {
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

    mock.expects('add').once().withArgs(subscription);

    this.underTest.subscribe(subscription);

    mock.verify();
  });

  it('rethrows error from subscriptionStorage', () => {
    const spy = sinon.spy();
    const mock = sinon.mock(subscriptionStorage);
    const subscription = {
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
    mock.expects('add').once().withArgs(subscription).throws();

    expect(() => this.underTest.subscribe(subscription)).to.throw('camps-subscription-failed');
  });
});
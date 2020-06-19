const underTest = require('../../storage/subscriptionStorage');
const expect = require('chai').expect;

describe('Tests for subscriptionStorage', () => {
  beforeEach(() => {
    for(let key in underTest.subscriptions) {
      delete underTest.subscriptions[key];
    }

    for(let key in underTest.campMonthsToRequest) {
      delete underTest.campMonthsToRequest[key];
    }
  });

  it('adds user in storage', () => {
    expect(underTest.subscriptions).to.deep.equal({});
    expect(underTest.campMonthsToRequest).to.deep.equal({});

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

    underTest.add(subscription);

    expect(underTest.subscriptions).to.deep.equal({
      1: {
        "2020-05-25:2020-05-26:2020-05-27": [1],
      },
      2: {
        "2020-06-25:2020-06-26:2020-06-27": [1],
      },
    });

    expect(underTest.campMonthsToRequest).to.deep.equal({
      1: [5],
      2: [6],
    });
  });

  it('adds user in storage with concrete key', () => {
    expect(underTest.subscriptions).to.deep.equal({});
    expect(underTest.campMonthsToRequest).to.deep.equal({});

    const subscription_1 = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-27"],
      }, {
        campId: 2,
        dates: ["2020-06-25", "2020-06-26", "2020-06-27"],
      }],
    };

    const subscription_2 = {
      userId: 2,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-25", "2020-05-26", "2020-05-27"],
      }],
    };


    underTest.add(subscription_1);
    underTest.add(subscription_2);

    expect(underTest.subscriptions).to.deep.equal({
      1: {
        "2020-05-25:2020-05-26:2020-05-27": [1, 2],
      },
      2: {
        "2020-06-25:2020-06-26:2020-06-27": [1],
      },
    });

    expect(underTest.campMonthsToRequest).to.deep.equal({
      1: [5],
      2: [6],
    });
  });

  it('adds months in ascending order', () => {
    expect(underTest.subscriptions).to.deep.equal({});
    expect(underTest.campMonthsToRequest).to.deep.equal({});

    const subscription_1 = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-30", "2020-05-31", "2020-06-01"],
      }],
    };

    const subscription_2 = {
      userId: 2,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-04-25", "2020-04-26", "2020-04-027"],
      }],
    };


    underTest.add(subscription_1);
    underTest.add(subscription_2);

    expect(underTest.campMonthsToRequest).to.deep.equal({
      1: [4, 5, 6],
    });
  });

  it('filters input dates and set as key', () => {
    expect(underTest.subscriptions).to.deep.equal({});
    expect(underTest.campMonthsToRequest).to.deep.equal({});

    const subscription = {
      userId: 1,
      notifyClient: 'whatsapp',
      camps: [{
        campId: 1,
        dates: ["2020-05-31", "2020-05-29", "2020-05-30"],
      }],
    };

    underTest.add(subscription);

    expect(underTest.subscriptions).to.deep.equal({
      1: {
        "2020-05-29:2020-05-30:2020-05-31": [1],
      },
    });
  });
});


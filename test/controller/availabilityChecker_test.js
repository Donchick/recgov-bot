const {campMonthsToRequest, subscriptions} = require('../../storage/subscriptionStorage');
const WhatsAppNotifier = require("../../api/whatsappClient");
const HttpDdosService = require('../../api/httpDdosService');
const AvailabilityChecker = require('../../controller/availabilityChecker');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('AvailabilityChecker controller tests', () => {
  afterEach(function() {
    sinon.restore();
    for(let prop in campMonthsToRequest) {
      delete campMonthsToRequest[prop];
    }
  });

  it('sends request based on storage data', (done) => {
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.resolves({campsites: {1: {availabilities: {}}}});

    campMonthsToRequest[1] = [1];

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      httpDdosServiceGetStub.restore();
      sinon.assert.calledWith(httpDdosServiceGetStub,
          "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-01-01T00%3A00%3A00.000Z");
      sinon.assert.calledOnce(httpDdosServiceGetStub);
      done()
    }, 0);
  });

  it('splits request lines by camp id', (done) => {
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-01-01T00%3A00%3A00.000Z"
    ).resolves({campsites: {1: {availabilities: {}}}});

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/2/month?start_date=2020-02-01T00%3A00%3A00.000Z"
    ).resolves({campsites: {2: {availabilities: {}}}});

    campMonthsToRequest[1] = [1];
    campMonthsToRequest[2] = [2];

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      httpDdosServiceGetStub.restore();
      sinon.assert.calledTwice(httpDdosServiceGetStub);
      expect(httpDdosServiceGetStub.firstCall.args[0]).to.equals(
          "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-01-01T00%3A00%3A00.000Z");
      expect(httpDdosServiceGetStub.secondCall.args[0]).to.equals(
          "https://www.recreation.gov/api/camps/availability/campground/2/month?start_date=2020-02-01T00%3A00%3A00.000Z");
      done();
    }, 0);
  });

  it('splits response lines by camp id', (done) => {
    const camp_1Availability = {campsites: {1: {availabilities: {}}}};
    const camp_2Availability = {campsites: {2: {availabilities: {}}}};
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-01-01T00%3A00%3A00.000Z"
    ).resolves(camp_1Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/2/month?start_date=2020-02-01T00%3A00%3A00.000Z"
    ).resolves(camp_2Availability);

    const parseResponseSpy = sinon.spy(AvailabilityChecker.prototype, 'parseResponses');

    campMonthsToRequest[1] = [1];
    campMonthsToRequest[2] = [2];

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      parseResponseSpy.restore();
      sinon.assert.calledTwice(parseResponseSpy);
      expect(parseResponseSpy.firstCall.args[0]).to.deep.equal([camp_1Availability]);
      expect(parseResponseSpy.secondCall.args[0]).to.deep.equal([camp_2Availability]);
      done();
    }, 0);
  });

  it('joins responses for one camp into single', (done) => {
    const camp_1Availability = {campsites: {1: {availabilities: {1: {}, site: 1}}}};
    const camp_2Availability = {campsites: {1: {availabilities: {2: {}, site: 2}}}};
    const camp_3Availability = {campsites: {1: {availabilities: {3: {}, site: 3}}}};
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-01-01T00%3A00%3A00.000Z"
    ).resolves(camp_1Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-02-01T00%3A00%3A00.000Z"
    ).resolves(camp_2Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-03-01T00%3A00%3A00.000Z"
    ).resolves(camp_3Availability);


    const parseResponseSpy = sinon.spy(AvailabilityChecker.prototype, 'parseResponses');

    campMonthsToRequest[1] = [1,2,3];

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      httpDdosServiceGetStub.restore();
      parseResponseSpy.restore();
      sinon.assert.calledOnce(parseResponseSpy);
      sinon.assert.calledThrice(httpDdosServiceGetStub);
      expect(parseResponseSpy.firstCall.args[0]).to.deep.equal(
          [camp_1Availability, camp_2Availability, camp_3Availability]);
      done();
    }, 0);
  });

  it('parses responses', (done) => {
    const camp_1_1Availability = {
      campsites: {
        1: {
          site: 1,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Not Available',
            '2020-06-02T00:00:00Z': 'Not Available',
            '2020-06-03T00:00:00Z': 'Not Available',
            '2020-06-04T00:00:00Z': 'Available',
            '2020-06-05T00:00:00Z': 'Available',
            '2020-06-06T00:00:00Z': 'Reserved',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Available',
          }
        }, 2: {
          site: 2,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Available',
            '2020-06-02T00:00:00Z': 'Available',
            '2020-06-03T00:00:00Z': 'Available',
            '2020-06-04T00:00:00Z': 'Reserved',
            '2020-06-05T00:00:00Z': 'Reserved',
            '2020-06-06T00:00:00Z': 'Reserved',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Not Available',
          }
        }
      }
    };
    const camp_1_2Availability = {
      campsites: {
        1: {
          site: 1,
          availabilities: {
            '2020-07-01T00:00:00Z': 'Available',
            '2020-07-02T00:00:00Z': 'Not Available',
            '2020-07-03T00:00:00Z': 'Not Available',
          }
        }
      }
    };
    const camp_2_1Availability = {
      campsites: {
        2: {
          site: 2,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Available',
            '2020-06-02T00:00:00Z': 'Available',
            '2020-06-03T00:00:00Z': 'Available',
            '2020-06-04T00:00:00Z': 'Reserved',
            '2020-06-05T00:00:00Z': 'Reserved',
            '2020-06-06T00:00:00Z': 'Reserved',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Not Available',
          }
        }
      }
    };
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-06-01T00%3A00%3A00.000Z"
    ).resolves(camp_1_1Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-07-01T00%3A00%3A00.000Z"
    ).resolves(camp_1_2Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/2/month?start_date=2020-06-01T00%3A00%3A00.000Z"
    ).resolves(camp_2_1Availability);

    const parseResponseSpy = sinon.spy(AvailabilityChecker.prototype,
        'parseResponses');

    campMonthsToRequest[1] = [6, 7];
    campMonthsToRequest[2] = [6];

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      parseResponseSpy.restore();
      const returnedValues = parseResponseSpy.returnValues;
      sinon.assert.calledTwice(parseResponseSpy);
      expect(returnedValues[0]).to.deep.equal({
        1: {
          '2020-06-04': true,
          '2020-06-05': true,
          '2020-06-07': true,
          '2020-06-30': true,
          '2020-07-01': true,
        }, 2: {
          '2020-06-01': true,
          '2020-06-02': true,
          '2020-06-03': true,
          '2020-06-07': true,
        }
      });
      expect(returnedValues[1]).to.deep.equal({
        2: {
          '2020-06-01': true,
          '2020-06-02': true,
          '2020-06-03': true,
          '2020-06-07': true,
        }
      });
      done();
    }, 0);
  });

  it('checks availability correctly', (done) => {
    const camp_1_1Availability = {
      campsites: {
        1: {
          site: 1,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Not Available',
            '2020-06-02T00:00:00Z': 'Not Available',
            '2020-06-03T00:00:00Z': 'Not Available',
            '2020-06-04T00:00:00Z': 'Available',
            '2020-06-05T00:00:00Z': 'Available',
            '2020-06-06T00:00:00Z': 'Available',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Available',
          }
        }, 2: {
          site: 2,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Available',
            '2020-06-02T00:00:00Z': 'Available',
            '2020-06-03T00:00:00Z': 'Available',
            '2020-06-04T00:00:00Z': 'Reserved',
            '2020-06-05T00:00:00Z': 'Reserved',
            '2020-06-06T00:00:00Z': 'Reserved',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Not Available',
          }
        },
        3: {
          site: 3,
          availabilities: {
            '2020-06-04T00:00:00Z': 'Available',
            '2020-06-05T00:00:00Z': 'Available',
            '2020-06-06T00:00:00Z': 'Available',
            '2020-06-07T00:00:00Z': 'Available',
          }
        },
      }
    };
    const camp_1_2Availability = {
      campsites: {
        1: {
          site: 1,
          availabilities: {
            '2020-07-01T00:00:00Z': 'Available',
            '2020-07-02T00:00:00Z': 'Not Available',
            '2020-07-03T00:00:00Z': 'Not Available',
          }
        }
      }
    };
    const camp_2_1Availability = {
      campsites: {
        2: {
          site: 2,
          availabilities: {
            '2020-06-01T00:00:00Z': 'Available',
            '2020-06-02T00:00:00Z': 'Available',
            '2020-06-03T00:00:00Z': 'Available',
            '2020-06-04T00:00:00Z': 'Reserved',
            '2020-06-05T00:00:00Z': 'Reserved',
            '2020-06-06T00:00:00Z': 'Reserved',
            '2020-06-07T00:00:00Z': 'Available',
            '2020-06-30T00:00:00Z': 'Not Available',
          }
        }
      }
    };
    const httpDdosServiceGetStub = sinon.stub(HttpDdosService.prototype, 'get');
    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-06-01T00%3A00%3A00.000Z"
    ).resolves(camp_1_1Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/1/month?start_date=2020-07-01T00%3A00%3A00.000Z"
    ).resolves(camp_1_2Availability);

    httpDdosServiceGetStub.withArgs(
        "https://www.recreation.gov/api/camps/availability/campground/2/month?start_date=2020-06-01T00%3A00%3A00.000Z"
    ).resolves(camp_2_1Availability);

    const checkAvailabilitySpy = sinon.spy(AvailabilityChecker.prototype,
        'checkAvailability');

    campMonthsToRequest[1] = [6, 7];
    campMonthsToRequest[2] = [6];

    subscriptions[1] = {
      '2020-06-04:2020-06-05:2020-06-06:2020-06-07': [1,2],
      '2020-06-04:2020-06-05:2020-06-07:2020-06-08': [3,4],
      '2020-06-30:2020-07-01': [1],
    };

    subscriptions[2] = {
      '2020-06-04:2020-06-05:2020-06-07': [1],
      '2020-06-03': [1],
    };

    this.underTest = new AvailabilityChecker();

    setTimeout(() => {
      checkAvailabilitySpy.restore();
      const returnedValues = checkAvailabilitySpy.returnValues;
      sinon.assert.calledTwice(checkAvailabilitySpy);
      expect(returnedValues[0]).to.deep.equal({
          '2020-06-04:2020-06-07': {
            campsiteIds: ['1', '3'],
            users: [1, 2],
          },
          '2020-06-30:2020-07-01': {
            campsiteIds: ['1'],
            users: [1],
          },
        }
      );
      expect(returnedValues[1]).to.deep.equal({
          '2020-06-03:2020-06-03': {
            campsiteIds: ['2'],
            users: [1],
          },
        });
      done();
    }, 0);
  })
});


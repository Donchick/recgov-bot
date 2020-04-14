const request = require('supertest');
const express = require('express');
const expect = require('chai').expect;

const app = require('../../app');

describe('POST /subscribe', function() {
  it('returns correct response for requiredDays option with gaps', function(done) {
    const expectedResponse = {
      1: {
        9999999999: [
          ['2020-05-07', '2020-05-09', '2020-05-10'],
          ['2020-05-14', '2020-05-16', '2020-05-17'],
          ['2020-05-21', '2020-05-23', '2020-05-24'],
          ['2020-05-28', '2020-05-30', '2020-05-31'],
          ['2020-06-04', '2020-06-06', '2020-06-07'],
        ],
      },
    };

    const subscriber = {
      phoneNumber: 9999999999,
      camps: [{
        campId: 1,
        startDate: '05-01-2020',
        endDate: '06-10-2020',
        requiredDays: [4,6,7],
      }]
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: JSON.stringify(subscriber)})
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
  });

  it('returns correct response for requiredDays option with week transfer', function(done) {
    const expectedResponse = {
      1: {
        9999999999: [
          ['2020-05-07', '2020-05-09', '2020-05-12'],
          ['2020-05-14', '2020-05-16', '2020-05-19'],
          ['2020-05-21', '2020-05-23', '2020-05-26'],
          ['2020-05-28', '2020-05-30', '2020-06-02'],
          ['2020-06-04', '2020-06-06', '2020-06-09'],
        ],
      },
    };

    const subscriber = {
      phoneNumber: 9999999999,
      camps: [{
        campId: 1,
        startDate: '05-01-2020',
        endDate: '06-10-2020',
        requiredDays: [4,6,2],
      }]
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: JSON.stringify(subscriber)})
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
  });

  it('returns correct response for requiredDays option for most popular days(Fr,Sat,San, Mon)', function(done) {
    const expectedResponse = {
      1: {
        9999999999: [
          ['2020-05-01', '2020-05-02', '2020-05-03', '2020-05-04'],
          ['2020-05-08', '2020-05-09', '2020-05-10', '2020-05-11'],
          ['2020-05-15', '2020-05-16', '2020-05-17', '2020-05-18'],
          ['2020-05-22', '2020-05-23', '2020-05-24', '2020-05-25'],
          ['2020-05-29', '2020-05-30', '2020-05-31', '2020-06-01'],
          ['2020-06-05', '2020-06-06', '2020-06-07', '2020-06-08'],
        ],
      },
    };

    const subscriber = {
      phoneNumber: 9999999999,
      camps: [{
        campId: 1,
        startDate: '05-01-2020',
        endDate: '06-10-2020',
        requiredDays: [5,6,7,1],
      }]
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: JSON.stringify(subscriber)})
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
  });

  it('returns correct response for daysInRow option with month transfer', function(done) {
    const expectedResponse = {
      1: {
        9999999999: [
          ['2020-05-29', '2020-05-30', '2020-05-31', '2020-06-01'],
          ['2020-05-30', '2020-05-31', '2020-06-01', '2020-06-02'],
          ['2020-05-31', '2020-06-01', '2020-06-02', '2020-06-03'],
          ['2020-06-01', '2020-06-02', '2020-06-03', '2020-06-04'],
          ['2020-06-02', '2020-06-03', '2020-06-04', '2020-06-05'],
        ],
      },
    };

    const subscriber = {
      phoneNumber: 9999999999,
      camps: [{
        campId: 1,
        startDate: '05-29-2020',
        endDate: '06-05-2020',
        daysInRow: 4,
      }]
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: JSON.stringify(subscriber)})
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
  });

  it('returns correct response for daysInRow option with in month period', function(done) {
    const expectedResponse = {
      1: {
        9999999999: [
          ['2020-05-25', '2020-05-26', '2020-05-27', '2020-05-28'],
          ['2020-05-26', '2020-05-27', '2020-05-28', '2020-05-29'],
          ['2020-05-27', '2020-05-28', '2020-05-29', '2020-05-30'],
        ],
      },
    };

    const subscriber = {
      phoneNumber: 9999999999,
      camps: [{
        campId: 1,
        startDate: '05-25-2020',
        endDate: '05-30-2020',
        daysInRow: 4,
      }]
    };

    request(app)
        .post('/api/subscribe')
        .set('Accept', 'application/json')
        .send({subscriber: JSON.stringify(subscriber)})
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
  });
});
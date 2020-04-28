var express = require('express');
var router = express.Router();
const { Client } = require('pg');

/* GET home page. */
router.get('/', function(req, res, next) {
  const client = new Client();
  client.connect();
  res.send(client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message) // Hello World!
    client.end();
    return err;
  }));
});

module.exports = router;

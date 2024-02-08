var express = require('express');
var router = express.Router();

let users = [
  {"user": "Janne"}
]

/* GET all users */
router.get('/', function(req, res) {
  res.send('users');

});

/* GET specific user */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;

var express = require('express');
var router = express.Router();

let users = [
  {"user": "Janne"}
]

/* GET all users */
router.get('/', function(req, res) {
  console.log("users", users);
  res.send(users);

});

/* GET specific user */
router.get('/user', function(req, res) {
  let findUser = req.body.name;
  console.log("find user", findUser);
  res.send(findUser);
});

/* POST create user */
router.post('/add', function(req, res) {
  let newUser = {
    "name": req.body.name,
  }
  console.log("new user", newUser);
  res.json(newUser);
});

module.exports = router;

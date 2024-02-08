var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tagsRouter = require('./routes/tags');
var tweetsRouter = require('./routes/tweets');

var app = express();

/* MongoClient.connect('')
  .then((client) => {
    console.log('We are connected to database');

    const db = client.db('matte-diem');
    app.locals.db = db;
  })
  .catch((err) => {
    console.log(err, 'could not connect to database');
    process.exit(1);
  }); */

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);
app.use('/api/tags', tagsRouter);

module.exports = app;

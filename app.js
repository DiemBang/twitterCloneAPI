var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const OpenAI = require('openai');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tagsRouter = require('./routes/tags');
var tweetsRouter = require('./routes/tweets');

var app = express();

MongoClient.connect(process.env.DB_URL)
  .then((client) => {
    console.log('We are connected to database');

    const db = client.db('matte-diem');
    app.locals.db = db;
  })
  .catch((err) => {
    console.log(err, 'could not connect to database');
    process.exit(1);
  });

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

const openai = new OpenAI({
  apiKey: process.env['AI_API_KEY'],
});

/* console.log('openai', openai); */

let chat = [{ id: 1, message: 'Hello world', name: 'Janne' }];

app.get('/chat', (req, res) => {
  res.json(chat);
});

app.post('/chat/friend', (req, res) => {
  const db = req.app.locals.db;

  db.collection('aiBots')
    .find()
    .toArray()
    .then((bots) => {
      const randomUser = bots[Math.floor(Math.random() * bots.length)];
      const friend = bots.find((ai) => ai.name === req.body.friend);
      console.log(bots);
      if (!req.body.random && !friend) {
        res.status(404).json({
          err: 'there does not exist a character in friends with that name',
        });
        console.log(
          'there does not exist a character in friends with that name'
        );
        return;
      }
      try {
        openai.chat.completions
          .create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: req.body.random ? randomUser.content : friend.content,
              },
              {
                role: 'user',
                content: req.body.message,
              },
            ],
          })
          .then((data) => {
            console.log('ai svar:', data.choices[0].message.content);

            let aiChat = {
              user: req.body.name,
              tweet: req.body.message,
              id: chat.length + 1,
              message: data.choices[0].message.content,
              name: req.body.random ? randomUser.name : friend.name,
            };

            db.collection('tweets')
              .insertOne(aiChat)
              .then((insertResult) => {
                // if insertOne operation goes through
                if (insertResult.acknowledged) {
                  console.log('sent product:', aiChat);
                  res.json(aiChat);
                } else {
                  res.status(500).json({ err: 'could not add to database' });
                }
              });
          });
      } catch (err) {
        console.error(err, 'error');
        res.status(500).json({ err: 'Something when horribly wrong!' });
      }
    });
});

module.exports = app;

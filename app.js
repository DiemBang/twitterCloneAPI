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

const openai = new OpenAI({
  apiKey: process.env['AI_API_KEY'],
});

/* console.log('openai', openai); */

let chat = [{ id: 1, message: 'Hello world', name: 'Janne' }];

app.get('/chat', (req, res) => {
  res.json(chat);
});

const aiBots = [
  {
    name: 'Ross',
    content:
      'Du är Ross i tv serien vänner och ska svara på frågor som honom. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
  {
    name: 'Chandler',
    content:
      'Du är Ross i tv serien vänner och ska svara på frågor som honom. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
  {
    name: 'Monica',
    content:
      'Du är Monica i tv serien vänner och ska svara på frågor som henne. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
  {
    name: 'Joey',
    content:
      'Du är Joey i tv serien vänner och ska svara på frågor som henne. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
  {
    name: 'Rachel',
    content:
      'Du är Rachael i tv serien vänner och ska svara på frågor som henne. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
  {
    name: 'Phoebe',
    content:
      'Du är Phoebe i tv serien vänner och ska svara på frågor som henne. Säg gärna någon av karaktärens citat eller catchphrase så att användaren vet att de pratar med tv karaktären. Svara enligt karaktärens personlighet',
  },
];

app.post('/chat', async (req, res) => {
  const randomUser = aiBots[Math.floor(Math.random() * aiBots.length)];

  console.log(randomUser);

  try {
    await openai.chat.completions
      .create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: randomUser.content,
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
          id: chat.length + 1,
          message: data.choices[0].message.content,
          name: randomUser.name,
        };

        chat.push(aiChat);
        // skicka in i databas
      });
  } catch (err) {
    console.error(err, 'error');
    res.status(500).json({ err: 'Something when horribly wrong!' });
  }

  res.json(chat);
});

module.exports = app;

var express = require('express');
var router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["AI_API_KEY"],
})

let tweets = [
  {
    user: 'Janne',
    tweets: [
      {
          'tweet':
          'Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.',
          'name': '',
          'answer': ''
      },
    ],
  },
];
router.get('/all', function (req, res, next) {
  console.log('tweets', tweets);
  res.json(tweets);
});

router.post('/tweet', (req, res) => {
  console.log(req.body);
  res.json({ user: req.body });
});

let chat = [
  {id: 1, message: "hello world", name: "Janne"}
]

router.post('/add', async (req, res) => {
  let newChat = {
    id: chat.length + 1,
    message: req.body.message,
    name: req.body.name
  }

  //SPARAT TILL DB

  chat.push(newChat);

  try {

    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "Du är ett bergstroll som hatar människor. Du är vresig och irriterad och lägger dig i allt som sägs."},
        {role: "user", content: req.body.message}
      ]
    })
    .then(data => {
      console.log("ai svar", data.choices[0].message.content);

      let aiChat = {
        id: chat.length + 1,
        message: data.choices[0].message.content,
        name: "Bergstrollet Engvar"
      }

      chat.push(aiChat);
      //req.app.locals.db.collection.insertOne(aiChat) 

    })

  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Something went wrong"});
  }

  res.json(tweets);
});

module.exports = router;

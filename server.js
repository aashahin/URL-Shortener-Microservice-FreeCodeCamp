require('dotenv').config();
const MONGO_URI = process.env['MONGO_URI'];
const PORT = process.env['PORT'];
const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const cors = require('cors');
const app = express();
const urlValidator = require('./urlValidator.js')

mongoose.connect(MONGO_URI);

const Url = mongoose.model('urls', new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
}))

// Basic Configuration
const port = PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  console.log('PARAMS---', req.params, 'BODY -----', req.body, 'QUERY ------', req.query)
  const url = req.body.url
  const validation = urlValidator(url)
  if (!validation) return res.send({ error: 'invalid url' })
  const isRepeateUrl = await Url.findOne({ original_url: url })
  if (isRepeateUrl) return res.json({
    original_url: isRepeateUrl.original_url,
    short_url: isRepeateUrl.short_url
  })
  const latestUrl = await Url.find({}).sort({ short_url: 'desc' }).limit(1)
  let newShortUrl = '1'
  if (latestUrl[0]) newShortUrl = (parseInt(latestUrl[0].short_url) + 1) + ''
  const newUrl = new Url({
    original_url: url,
    short_url: newShortUrl
  })
  let result
  try {
    result = await newUrl.save()
  } catch (err) {
    return console.error('ERRORR F', err)
  }
  return res.send({
    original_url: result.original_url,
    short_url: result.short_url
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const short_urlParam = req.params.short_url
    const url = await Url.findOne({ short_url: short_urlParam })
    if (url) return res.redirect(url.original_url)
    return res.send({ message: 'Not Found' })
  } catch (e) {
    return console.error('LAST  ---- ', e)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

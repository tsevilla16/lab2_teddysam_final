const bodyParser = require('body-parser');
const express = require('express');
const _ = require('lodash');
const path = require('path');
const session = require('express-session');
require('cross-fetch/polyfill');

const app = express();
const host = '127.0.0.1';
const port = 3000;

// begins as an empty object - no comments yet from users
const comments_list = {}

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'artmuseum'
}));

const API_KEY = "7657d4b0-b77e-11e8-a4d1-69890776a30b";

// behavior for the index route
app.get('/', (req, res) => {
  const url = `https://api.harvardartmuseums.org/gallery?size=100&apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    res.render('index', {galleries: data.records});
  });
});

// behavior for the object list within a given gallery
app.get('/gallery/:gallery_id', function(req, res) {
  const url = `https://api.harvardartmuseums.org/object?gallery=${req.params.gallery_id}&apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    // renders objects view given data response from url fetch w/ API data
    res.render('objects', {objects: data.records});
  });
});

// behavior for individual object view
app.get('/object/:object_id', function(req, res) {
  const url = `https://api.harvardartmuseums.org/object/${req.params.object_id}?apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    res.render('individualobject', {data: data, comments: comments_list, object_id: data.objectid});
  });
});

// behavior for individual object view when comment is posted via form
app.post('/object/:object_id', (req, res) => {
  // stores new comment to comments_list object
  let input = req.body.query;
  // check that comment is not empty
  if (input != "") {
    if (!(req.params.object_id in comments_list)) {
      // if object id does not exist as key, add key-value pair with id and comment
      comments_list[req.params.object_id] = [input]
    } else {
      // otherwise just add comment to array of existing comments
      comments_list[req.params.object_id].push(input)
    }
  }
  res.redirect(req.originalUrl);
});

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});

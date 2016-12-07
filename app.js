var express = require('express');
var request = require('request');
var mongodb = require('mongodb');
require('dotenv').config();
var app = express();

var apiKey = process.env.API_KEY;
var cx = process.env.API_CX;

// For MongoDB connection
var MongoClient = mongodb.MongoClient;
var MongoURL = process.env.MONGOLAB_URI;

var handlebars = require('express-handlebars').create({ defaultLayout: null });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/api/search?*', function (req, res) {
  var outPutJson = {};
  var queryTerm = req.query.q;

  MongoClient.connect(MongoURL, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', MongoURL);
    }

    // do some work here with the database.
    var collection = db.collection('recent');
    var search = { query: queryTerm, when: Date() };
    collection.insert(search, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      }

      // Close connection

      db.close();
    });
  });

  var apiUrl = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=' + cx + '&q=' + queryTerm + '&searchType=image' + '&fields=items(link,snippet,image/thumbnailLink,image/contextLink)';
  request(apiUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      outPutJson = JSON.parse(body);
      res.send('<pre>' + body + '</pre>');
    }
  });
});

app.get('/api/recent', function (req, res) {
  var outPutJson = [];

  MongoClient.connect(MongoURL, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', MongoURL);
    }

    // do some work here with the database.
    var collection = db.collection('recent');
    collection.find({}).toArray(function (err, documents) {
      res.json(documents);
      db.close();
    });
  });
});

// custom 404 page
app.use(function (req, res, next) {
  res.status(404);
  res.render('404');
});

// custom 500 page
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-c to terminate.');
});

var express = require('express');
var request = require('request');
var mongodb = require('mongodb');
require('dotenv').config();
var app = express();

var apiKey = process.env.API_KEY;
var cx = process.env.API_CX;


// For MongoDB connection
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);

    // do some work here with the database.

    //Close connection
    db.close();
  }
});

var handlebars = require('express-handlebars').create({ defaultLayout: null });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/api/search?*', function (req, res) {
  // var queryObject = req.path;
  // var queryString = queryObject.slice(5);
  // var outPutJson = {};
  // res.json(outPutJsapion);

  var outPutJson = {};
  var queryTerm = req.query.q;
  var apiUrl = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=' + cx + '&q=' + queryTerm + '&searchType=image' + '&fields=items(link,snippet,image/thumbnailLink,image/contextLink)';
  request(apiUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(response);
      // console.log(body);
      // console.log(response.body.items);

      // console.log(body);
      outPutJson = JSON.parse(body);

      // console.log(outPutJson)
      // outPutJson = qs.parse(body);
      // console.log(outPutJson.items);

      // console.log(body[items]);
      // outPutJson = JSON.stringify(body).items;
      // res.json(outPutJson);
      res.send('<pre>' + body + '</pre>');
    }
  });

  // console.log(req.query.id);
  // console.log(queryTerm);

  // res.send('Welcome to search API');
});

app.get('/api/recent', function (req, res) {
  res.send('Welcome to recent API');
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

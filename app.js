var express = require('express');
var app = express();

var handlebars = require('express-handlebars').create({ defaultLayout: null });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/new/*', function (req, res) {
  var queryObject = req.path;
  var queryString = queryObject.slice(5);
  var outPutJson = {};
  res.json(outPutJson);
});

app.get('/*', function (req, res) {
  res.send('');
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

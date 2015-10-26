var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var handlebarsExpress = require('express-handlebars');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var child_process = require('child_process');
var images = require('./lib/images.js');
var pg = require('pg');

var conString = "postgres://postgres:postgresslocalpassword@accesslog/";

var app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.engine('handlebars', handlebarsExpress());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use('/res', express.static('public'));

SESSION_CACHE = {};
IMAGE_CACHE = [{name:"Loading...", color:"grey"}];

var image_fetch = setInterval(function() {
  images.getArray(function(err, out, stderr) {
    if (!err) IMAGE_CACHE = out;
  });
}, 5000);

app.get('/', function(req, res) {
  res.render('isauth', {layout: 'index',
                        images: IMAGE_CACHE});
});

app.get('/login', function(req, res) {
  res.render('noauth', {layout: 'index'});
});

app.get('/images/*', function(req, res) {
  res.render('image', {layout: 'index', color:'blue', name:'not found'});
});

app.listen(process.env.WEBPORT || 80);

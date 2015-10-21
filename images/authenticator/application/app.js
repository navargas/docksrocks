var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LdapStrategy = require('passport-ldapauth').Strategy;
var pg = require('pg');

var conString = "postgres://postgres:postgresslocalpassword@accesslog/";

var app = express();
//app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(passport.initialize());

SUCCESS=201;
FAILURE=401;

var LDAP_OPTS = {
  server: {
    url: 'ldap://bluepages.ibm.com:389',
    bindCredentials: '',
    searchBase: 'ou=bluepages,o=ibm.com',
    searchFilter: '(&(objectclass=ibmPerson)(mail={{username}}))',
    searchAttributes: ['mail', 'callupName']
  }
};

passport.use(new LdapStrategy(LDAP_OPTS));
passport.serializeUser(function(user, done) {
  console.log('serial', user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.session());
var INSERT_LOG = 'INSERT INTO access VALUES (localtimestamp, $1, $2, $3, $4)';
var isBlob = new RegExp('.+/blobs/.+');
function dbLog(user, uri, method, illegal, ip) {
  if (isBlob.test(uri)) return; // ignore blobs
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('INSERT INTO access VALUES (localtimestamp, $1, $2, $3, $4, $5)', [user, uri, method, illegal, ip], function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      done();
    });
  });
}

function sameUserPolicy(headers) {
  /* Ensure that the user owns the object they are trying to modify */
  var user = headers['x-original-user'];
  var method = headers['x-original-method'];
  var ip = headers['x-original-addr'];
  var uri = headers['x-original-uri'].split('/');
  if (method == 'GET' || method == 'HEAD') {
    dbLog(user, headers['x-original-uri'], method,'false',ip);
    return true;
  }
  if (user == 'ranjanr_us' || user == 'navargas_us') {
    dbLog(user, headers['x-original-uri'], method,'false',ip);
    return true;
  }
  if (uri[2] && uri[2] != user) {
    dbLog(user, headers['x-original-uri'], method,'true',ip);
    return false;
  }
  dbLog(user, headers['x-original-uri'], method,'false',ip);
  return true;
}

var authCache = {};
app.get('/auth', function(req, res, next) {
  if (!sameUserPolicy(req.headers)) {
    res.status(FAILURE).end();
    return;
  }
  if (req.headers.authorization) {
    if (authCache[req.headers.authorization]) {
      res.status(SUCCESS).end();
      return;
    }
    var decode = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString('ascii');
    var username = decode.split(':')[0];
    var password = decode.split(':')[1];
    var components = username.split('_');
    var country = components.pop();
    var user = components.join([separator = '_']);
    username = user + '@' + country + '.ibm.com';
    req.body = {username:username, password:password};
    passport.authenticate('ldapauth', function(err, user, info) {
      if (user) {
        authCache[req.headers.authorization] = true;
        dbLog(req.headers['x-original-user'], 'ldap://bluepages.ibm.com/', 'LDAP', 'false', req.headers['x-original-addr']);
        res.status(SUCCESS).end();
      } else {
        dbLog(req.headers['x-original-user'], 'ldap://bluepages.ibm.com/', 'LDAP', 'true', req.headers['x-original-addr']);
        res.status(FAILURE).end();
      }
    })(req, res, next);
  } else {
    res.append('WWW-Authenticate', 'Basic');
    res.status(FAILURE).end();
    return;
  }
});

app.listen(80);

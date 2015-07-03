var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var http = require('http');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');

//init
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(expressSession({
  secret: 'superSecretaChaveBadaueVo'
}));
app.use(passport.initialize());
app.use(passport.session());


//rotas
var users = require('./routes/user');

app.use('/users', users);


var User = require('./models/user-model');

passport.use(new LocalStrategy({
    // set the field name here
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    /* get the username and password from the input arguments of the function */

    // query the user from the database
    // don't care the way I query from database, you can use
    // any method to query the user from database
    User.findOne({
      username: username , password : password
    }, function(err, doc) {
      if(!err)
      done(null, false, { message: 'logado.' });
    });
  }
));



//passport middlewere
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // query the current user from database
  User.find(id)
    .success(function(user) {
      done(null, user);
    }).error(function(err) {
      done(new Error('User ' + id + ' does not exist'));
    });
});


app.get('/login', loginGet);

function loginGet(req, res) {
  if (req.user) {
    // already logged in
    res.status(200).json({
      success: true,
      user : req.user
    });
  } else {
    res.status(200).json({
      success: false
    });
  }
}

app.post('/login', loginPost);

function loginPost(req, res, next) {
  // ask passport to authenticate
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      // if error happens
      return next(err);
    }

    if (!user) {
      // if authentication fail, get the error message that we set
      // from previous (info.message) step, assign it into to
      // req.session and redirect to the login page again to display
      req.session.messages = info.message;
      return res.status(200).json({
        success: true,
        user : info
      });
    }

    // if everything's OK
    req.logIn(user, function(err) {
      if (err) {
        req.session.messages = "Error";
        return next(err);
      }

      // set the message
      req.session.messages = "Login successfully";
      return res.redirect('/');
    });

  })(req, res, next);
}


app.use(function(req, res, next) {
  var err = new Error('not found');
  err.status = 404;
  next(err);
})

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});



//configure mongoose
mongoose.connect('mongodb://dbrandesadmin:dbrandespass@ds041992.mongolab.com:41992/dbrandes');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(callback) {
  console.log('conectado a database');
});



// configurações porta e server
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listen', onListening);


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
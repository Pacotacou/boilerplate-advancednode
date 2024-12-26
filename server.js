'use strict';
const routes = require('./routes.js');
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const {ObjectID} = require('mongodb');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
app.set('views','./views/pug');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {secure:false}
}));
app.use(passport.initialize())
app.use(passport.session())

myDB(async function(client){
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);

  app.use(function(req,res,next){
    res.status(404)
      .type('text')
      .send('Not Found');
  })

  passport.serializeUser(function(user,done){
    done(null,user._id);
  });
  passport.deserializeUser(function(id,done){
    myDataBase.findOne({_id: new ObjectID(id)}, function(err,doc){
      done(null,doc);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done){
    myDataBase.findOne({username:username},function(err,user){
      console.log(`User ${username} attempted to log in.`);
      if (err) return done(err);
      if (!user) return done(err);
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      /*if (password !== user.password) return done(null,false);
      return done(null,user);*/
    });
  }));


}).catch(function(e){
  app.route('/').get(function(req,res){
    res.render('index',{
      title: e,
      message: 'Unable to connect to database'
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

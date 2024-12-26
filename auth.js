const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();
const passport = require('passport');

module.exports = function (app, myDataBase){
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://sussex-quotations-rank-ones.trycloudflare.com/'
      },
        function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          //Database logic here with callback containing your user object
        }
      ));
}
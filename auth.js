const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();
const passport = require('passport');

module.exports = function (app, myDataBase){
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.SITE_URL+'/auth/github/callback'
      },
        function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          //Database logic here with callback containing your user object
          myDataBase.findOneAndUpdate(
            {id:profile.id},
            {
                $setOnInsert: {
                    id:profile.id,
                    username: profile.username,
                    name:profile.displayName || 'John Doe',
                    photo: profile.photos[0].value || '',
                    email: Array.isArray(profile.emails)
                        ? profile.emails[0].value
                        :'No public email',
                    created_on: new Date(),
                    provider: profile.provider || ''
                },
                $set: {
                    last_login: new Date()
                },
                $inc: {
                    login_count: 1
                }
            },
            { upsert: true, new: true},
            function(err,doc){
                return cb(null,doc.value);
            }
          )
        }
      ));
}
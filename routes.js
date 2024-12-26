
const passport = require('passport');

module.exports = function (app, myDataBase){

    function ensureAuthenticated(req,res,next){
        if (req.isAuthenticated()){
        return next();
        }
        res.redirect('/');
    };

    app.route('/')
        .get(function(req, res){
        res.render('index',{
            title:"Connected to Database",
            message:"Please log in",
            showLogin: true,
            showRegistration: true,
            showSocialAuth: true
        });
    });

    app.route('/auth/github')
        .get(
            passport.authenticate('github')
        );

    app.route('/auth/github/callback')
        .get(
            passport.authenticate('github',{failureRedirect: '/'})
        );
  
    app.route('/login')
        .post(
        passport.authenticate('local',{failureRedirect: '/'}),
        function(req,res){
            res.redirect('/profile');
        }
        );

    app.route('/logout')
        .get(function(req,res){
        req.logout();
        res.redirect('/');
        })
  
    app.route('/profile')
        .get(ensureAuthenticated, function(req,res){
        res.render('profile',{
            username: req.user.username,
        });
        });
  
    app.route('/register')
        .post(function(req,res,next){
        myDataBase.findOne({ username: req.body.username}, function(err,user){
            if (err){
            next(err);
            }else if (user){
            res.redirect('/');
            }else {
            const hash = bcrypt.hashSync(req.body.password,12);
            myDataBase.insertOne({
                username: req.body.username,
                password: hash
            },function(err,doc){
                if(err){
                res.redirect('/');
                }else{
                // the inserted document is held within
                // the ops property of the doc
                next(null,doc.ops[0])
                }
            })
            }
        }),
        passport.authenticate('local', {failureRedirect: '/'}),
        function(req,res,next){
        res.redirect('/profile');
        }});
}
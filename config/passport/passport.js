//load bcrypt
var bCrypt = require("bcrypt-nodejs");

module.exports = function (passport, user) {
    var User = user;
    var LocalStrategy = require("passport-local").Strategy;
    //serialize
    
    passport.serializeUser(function (user, done) {
        console.log(user.id);
        done(null, user.id);
    });
    // deserialize user 
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {
            if (user) {
                done(null, user.get());
                console.log("deserialize if");
            } else {
                done(user.errors, null);
                console.log("deserialize else");
            }
        });
    });
    passport.use("local-signup", new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            var generateHash = function (password) {
                console.log("hash generated");
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            User.findOne({
                where: {
                    username: username
                }
            }).then(function (user) {
                console.log("checking for username...");
                if (user) {
                    console.log("username is taken");
                    return done(null, false, {
                        message: "That username is already taken"
                    });
                } else {
                    var userPassword = generateHash(password);
                    var data =
                    {
                        username: username,
                        password: userPassword
                    };
                    console.log("username and password stored");
                    User.create(data).then(function (newUser, created) {
                        if (!newUser) {
                            console.log("welcome back");
                            return done(null, false);
                        }
                        if (newUser) {
                            console.log("new user created");
                            return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));

    //LOCAL SIGNIN
    passport.use("local-signin", new LocalStrategy(

        {
            // by default, local strategy uses username and password, we will override with username
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, username, password, done) {
            var User = user;
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            };
            User.findOne({
                where: {
                    username: username
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, {
                        message: "Username does not exist"
                    });
                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: "Incorrect password."
                    });
                }
                var userinfo = user.get();
                console.log("sign in successful");
                console.log(userinfo);
                return done(null, userinfo);
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: "Something went wrong with your sign in"
                });
            });
        }
    ));
};
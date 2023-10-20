const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


//User model
const User = require('../models/User');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');


// Login Page
router.get('/login', (req, res) => {
    res.render('login');
})

// Register Page
router.get('/register', (req, res) => {
    res.render('register');
})

// Register Handle
router.post('/register', (req, res) => {
    // console.log(req.body);
    // res.send('Hello');

    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check Pass length
    if (password.length < 6) {
        errors.push({ msg: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    }
    else {
        // res.send('pass');
        User.findOne({ email: email }).
            then((user) => {
                if (user) {
                    // User Exists
                    errors.push({ msg: "Email is already registered" });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                    });

                    // console.log(newUser);
                    // res.send('hello');



                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            // console.log(salt);
                            // console.log(hash);
                            if (err) { throw err };

                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save().then(() => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                                .catch(err => console.log(err))
                        })
                    })
                    // User.create(newUser);
                }
            })
        // Validation Passed
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout Handle
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');

        res.redirect('/users/login');
    });
})

router.get('/details',ensureAuthenticated, async (req, res) => {
    try {
      const users = await User.find({});
      res.render('details', { users}); 
    } catch (error) {
      req.flash('error_msg', 'Error retrieving data! Try again!');
      res.redirect('/dashboard');
    }
  });


module.exports = router;



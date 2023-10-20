require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


const app = express();

// Passport config
require('./config/passport')(passport);

// DB config
const db = process.env.UNIQUE_KEY;

// Connect to Mongo


//EJS
app.use('/public/images/', express.static('./public/images'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.json())


// BodyParser
app.use(express.urlencoded({ extended: false }));

// Express Session 
app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req,res,next)=>{
    //* The res. locals is an object that contains the local variables for the response which are scoped to the request only and therefore just available for the views rendered during that request or response cycle.

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await mongoose.connect(db,
            { useNewUrlParser: true, useUnifiedTopology: true }
        ).then(() => { console.log(`connected DB`); }).catch((err) => { console.log(err); });
        app.listen(PORT, console.log(`Server is listening on port ${PORT}...`));
    } catch (error) {
        console.log(error);
    }
}

start();


// require user model
const User = require("../models/User.model");
// require express
const router = require("express").Router();
// require bcrypt for password encryption
const bcrypt = require('bcryptjs');

// Handles GET requests to /logout page
router.get('/logout', (req, res, next) => {
    // Delete the session from MongoDB
    req.session.destroy()
    // set isLoggedIn to false to change the menu layout
    req.app.locals.isLoggedIn = false;
    // redirect to home
    res.redirect('/')
})

// Handles GET request to /signup page
router.get('/signup', (req, res, next) => {
    res.render('auth/signup.hbs')
})

// Handles GET requests to /signin page
router.get('/signin' , (req, res, next) => {
    res.render('auth/signin.hbs')
})

// Handles POST requests to /signup + sends input to DB
router.post('/signup', (req, res, next) => {
    const {username, email, password} = req.body

    // check if user has filled all fields
    if (!username || !email || !password) {
        res.render('auth/signup.hbs', {error: 'Please enter all fields'})
        // To tell JS to come out of this function
        return;
    }

    // check for email format
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //check if email does not match the regex
    if (!re.test(email)) {
        res.render('auth/signup.hbs', {error: 'Email address not valid. Please check and try again.'})
        // Again tell JS to leave function
        return;
    }

    // check the password strength
    const passRegEx = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (!passRegEx.test(password)) {
        res.render('auth/signup.hbs', {error: 'Password not strong enough. Make sure your password is 6-16 characters long and includes both a special character and a number.'})
        return;
    }

    // Password encyrption time! 
    // Generate salt
    const salt = bcrypt.genSaltSync(10);
    // Uses the salt and the password to create a hashed password
    const hash = bcrypt.hashSync(password, salt);
    User.create({username, email, password: hash})
        .then(() => {
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })

})

// Handles POST requests to /signin and enables login
router.post('/signin', (req, res, next) => {
    const {email, password} = req.body

    // check if the email is in the DB
    User.findOne({email})
        .then((user) => {
            if (user) {
                // If the inputted email does exist in the DB
                // remember password = inputted password
                // user.password = 
               let isValid = bcrypt.compareSync(password, user.password);
               console.log(isValid)
               if (isValid) {
                   // If password matches
                   // We will redirect the user to a /profile page
                   req.session.loggedInUser = user
                   // globally scoped variable - logged in
                   req.app.locals.isLoggedIn = true;
                   res.redirect('/profile')

               } else {
                   // If password does not match
                   res.render('auth/signin', {error: 'Invalid password'})
               }
            }
            else {
                // If the inputted email does not exist in the DB
                res.render('auth/signin', {error: 'Email does not exist'})
            }
        })
        .catch ((err) => {
            next(err)
        })

})

// Custom middleware to make it private
function checkLoggedIn(req, res, next) {
    if (req.session.loggedInUser) {
        next()
    } 
    else {
        res.redirect('/signup')
    }
}

// Handles GET requests to /profile page - invokes custom middlewar to make the page private
router.get('/profile', checkLoggedIn, (req, res, next) => {
    res.render('auth/profile.hbs', {name:  req.session.loggedInUser.username})
})

module.exports = router;
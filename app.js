// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const projectName = "basic-auth";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`;

//-----------------------------------------
// This is where we set up our session and use connect-mongo to store it in our DB
// install https://www.npmjs.com/package/express-session and https://www.npmjs.com/package/connect-mongo
// Must be placed before routes
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialize: false,
    cookie: {
        maxAge: 1000 * 24 * 60 * 60 // cookie cleared after these miliseconds 
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || "mongodb://localhost/basic-auth",
        ttl: 24 * 60 * 60 // session cleard after these seconds
    })
  }));
//-----------------------------------------

// MAKE ALL PAGES PRIVATE BY DEFAULT
/*
app.use((req, res, next) => {
  if ( req.session.loggedInUser) {
      next()
  }
  else{
    res.redirect('/signin')
  }
})
*/

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const authRoutes = require('./routes/auth.routes')
app.use("/", authRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

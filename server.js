//===============================//
// Entry file for backend server //
//===============================//

// imports
const express = require('express') // express app
const mongoose = require('mongoose') // mongoose package for mongodb
require('dotenv').config() // fetch env variables

const userRoutes = require('./routes/user') // user routes
const projectRoutes = require('./routes/project') // project routes
const skillRoutes = require('./routes/skill') // skill routes
const organisationRoutes = require('./routes/organisation') //organisation routes
const assignmentRoutes = require('./routes/assignment') // assignment routes

// start up express app
const app = express()

// middleware - fires for every requests that comes in
app.use(express.json()) // looks for body in the data and attaches it to the request object to allow access to the request handlers

// logger - for us to see the request path and method in the console
app.use((req, res, next) => {
    console.log(req.path, req.method) // logs the request path and method

    next() // moves on to the next middleware -> must be called otherwise the call stops here
})

// register route handler - reacts to requests sent in
app.use('/api/user', userRoutes); // any request to /api/user will be handled in userRoute.js in the routes folder
app.use('/api/project', projectRoutes); // any request to /api/project will be handled in projectRoute.js in the routes folder
app.use('/api/skill', skillRoutes); // any request to /api/skill will be handled in skillRoute.js in the routes folder
app.use('/api/organisation', organisationRoutes); // any request to /api/organisation will be handled in organisationRoutes.js in the routes folder
app.use('/api/assignment', assignmentRoutes) // any request to /api/assignment will be handled in assignment.js in the routes folder

// connect to MongoDB and listen for requests
mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            // only starts listening when database is connected
            app.listen(process.env.PORT, () => {
                console.log('Connected to MongoDB and Listening on port', process.env.PORT);
            });
        })
        .catch((error) => {
            console.log(error);
        })



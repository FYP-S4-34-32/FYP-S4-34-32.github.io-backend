//=============================================//
// Protect our API from unauthenticated access //
//=============================================//

// imports
const jwt = require('jsonwebtoken') // jsonwebtoken package to help our backend and frontend to communicate with regards to authentication
const User = require('../models/userModel') // MongoDB model created in userModel.js in the models folder

//==============================================================================================================//
// VERIFY AUTHORISATION HEADER
// 1. OBTAIN the authorisation header from the request body
// 2. CHECK for the existence of the authorisation token, return error message if NULL
// 3. OBTAIN the token portion from the authorisation header using the split string method
//    Format of the header is -> 'Bearer (token as string)'
// 4. VERIFY the token against the SECRET password that we store in the .env file and capture the _id property
//    --> the _id property is the _id property of the user object
// 5. FIND the user according to its _id property and attaches the _id field to request for the next middleware
//==============================================================================================================//
const requireAuthentication = async (req, res, next) => { // request, response, point to the next middleware
    const { authorization } = req.headers // authorization will be in the following format: 'Bearer (token as string)'

    // if there is no value for the authorization header
    if (!authorization) {
        return res.status(401).json({error: 'Authorisation token required'})
    }

    // grab the token from the authorization header
    const token = authorization.split(' ')[1]

    // verify the token
    try {
        const { _id } = jwt.verify(token, process.env.SECRET) // grabs _id from the token - user id
        

        // use id to find the user and attach it to the next middleware
        req.user = await User.findOne({ _id }) // grabs the user object to be used in the next middleware
        
        next() // fires the next handler function

    } catch (error) {
        console.log(error) // log the error in our console
        res.status(401).json({error: 'Request is not authorised'}) // return error message as a response message
    }
}

// EXPORTS
module.exports = requireAuthentication
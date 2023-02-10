//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const User = require('../models/userModel') // MongoDB model created in userModel.js in the models folder
const mongoose = require('mongoose') // mongoose package for mongodb
const jwt = require('jsonwebtoken') // jsonwebtoken package to help our backend and frontend to communicate with regards to authentication
const nodemailer = require('nodemailer') // nodemailer package to send emails

// to generate json web tokens - takes in the _id property of the user
const createToken = (_id) => {
    // the sign function will take in a SECRET, which is a randomly generated password(by us)
    // to sign the token
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '1d'}) // token expires in 1 day
}

// generate json web token for resetting of password. Should expire in 30 MIN
const createResetPasswordToken = (email) => {
    return jwt.sign({email}, process.env.SECRET, { expiresIn: '30m'}) // token expires in 30 minutes
}
    
//================================================================================================================//
// LOGIN USER:
// 1. invoke the userSchema.statics.login function from userModel.js inside the models folder
// 2. IF everything is ok(login successful), function will return the user object
// 3. ELSE(login UNSUCCESSFUL) the function will return an error, which will be caught in the catch(error) block
//    and return an error message written in the userSchema.statics.login function
// 4. store the user object returned to us in the variable 'user'
// 5. create a jsonwebtoken which takes in the _id property of the user
// 6. returns the user's email and the token we just generated in json format
//================================================================================================================//
const loginUser = async (req, res) => {
    // the body of the request in our login case will be in the following format:
    // {
    //      "email": "example@email.com",
    // }    "password": "example password"
    // -> so we can destructure the request body and obtain the email and password value

    const {email, password} = req.body

    try {
        // invoke login function and store return value(user document)
        const user = await User.login(email, password)
        
        const { role, name, contact, skills, organisation_id, current_assignment, project_assigned } = user

        // create a jsonwebtoken
        const token = createToken(user._id)

        // return the user's email, role, and the token we just generated in json format
        res.status(200).json({email, token, role, name, contact, skills, organisation_id, current_assignment, project_assigned })
    } catch (error) { // catch any error that pops up during the login process - refer to the login function in userModel.js
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

//================================================================================================================//
// SIGNUP USER:
// 1. invoke the userSchema.statics.signup function from userModel.js inside the models folder
// 2. IF everything is ok(signup successful), function will return the user object
// 3. ELSE(signup UNSUCCESSFUL) the function will return an error, which will be caught in the catch(error) block
//    and return an error message written in the userSchema.statics.signup function
// 4. store the user object returned to us in the variable 'user'
// 5. create a jsonwebtoken which takes in the _id property of the user
// 6. returns the user's email and the token we just generated in json format
//================================================================================================================//
const signupUser = async (req, res) => {
    // the body of the request in our login case will be in the following format:
    // {
    //      "name": "example choo"
    //      "email": "example@email.com",
    // }    "password": "example password"
    // -> so we can destructure the request body and obtain the name, email and password value

    const {name, email, password, confirmPassword, role, organisation_id} = req.body

    try {
        // invoke signup function and store return value(user document)
        const user = await User.signup(name, email, password, confirmPassword, role, organisation_id)
        
        // create a jsonwebtoken
        const token = createToken(user._id)

        const successMsg = "Account for (" + email + ") created successfully!"

        // return the user's name, email, role and the token we just generated in json format
        res.status(200).json({name, email, token, role, successMsg})
    } catch (error) { // catch any error that pops up during the login process - refer to the login function in userModel.js
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// GET all users info
const getAllUserInfo = async (req, res) => {
    const users = await User.getAllUsers()

    // console.log(users)

    res.status(200).json(users)
}

// GET user info
const getUserInfo = async (req, res) => {
    const { email } = (req.body) // grab email from the request object

    // get the document
    const userInfo = await User.getOneUser(email)
    
    res.status(200).json(userInfo)
}

// UPDATE user contact info
const updateUserInfo = async (req, res) => {
    const {email, contact} = req.body

    try {
        // invoke updateInfo function in userModel.js
        const user = await User.updateInfo(email, contact)

        // success message
        const successMsg = "Contact info updated!"

        // return the request object
        res.status(200).json({ user, successMsg })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// UPDATE use role info
const updateUserRole = async (req, res) => {
    const {email, role} = req.body

    try {
        // invoke updateInfo function in userModel.js
        const user = await User.updateRole(email, role)

        // success message
        const successMsg = "Role updated!"

        // return the request object
        res.status(200).json({ user, successMsg })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// POST a new skill
const addUserSkill = async (req, res) => {
    const { email, skill, competency } = req.body // req.body -> { "email": email, "skill": skillName, "competency": competencyLevel }
    
    try {
        // invoke addNewSkill function in userModel.js
        const user = await User.addNewSkill(email, skill, competency)

        const skills = user.skills

        // return the email and skills
        res.status(200).json({ email, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }

}
 
// UPDATE skill competency
const updateUserSkill = async (req, res) => { 
    const { email, skills } = req.body // req.body -> { "email": email, "skills": skillArr}

    try {
        // invoke updateSkill function in userModel.js
        const user = await User.updateSkill(email, skills) 

        // return the email and skills
        res.status(200).json({ user })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// DELETE user skill
const deleteUserSkill = async (req, res) => {
    const { email } = req.body

    try {
        // invoke deleteSkill function in userModel.js
        const user = await User.deleteSkill(req)

        const skills = user.skills

        // return the email and skills
        res.status(200).json({ email, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

const changeUserPassword = async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword} = req.body

    try {
        // invoke changePassword function in userModel.js
        const user = await User.changePassword(email, currentPassword, newPassword, confirmPassword)

        const successMsg = "Password changed successfully!"

        // return the email and skills
        res.status(200).json({ user, successMsg })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

const validateEmail = async (req, res) => {
    const { email } = req.body

    try {
        // invoke validateEmail function in userModel.js
        const response = await User.validateEmail(email)  

        // user exists, create a reset password token
        const resetPwdToken = createResetPasswordToken(email) // sensitive! do not send this to the frontend

        const emailMsg = "Hello, " + email + ".\n\nPlease use the following token to reset your password: \n\n" + resetPwdToken + "\n\nThis token will expire in 30 minutes.\n\nThank you.\n\nRegards,\nAutomatic Project Assignment"
    
        // save the token to the database
        const updatedTokenRes = await User.updateResetPasswordToken(email, resetPwdToken)
        
        // send token to user's email address
        const client = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "fyp22s432@gmail.com", // gmail  
                pass: "xfxwoyshgcbhfewx" // gmail acc's APP password for nodemailer
            }
        });
        
        client.sendMail(
            {
                from: "automatic-project-assignment",
                to: email,
                subject: "Reset Password Token",
                text: emailMsg
            }
        )

        res.status(200).json({ response })  
        
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

const resetPassword = async (req, res) => {
    const { email, token, newPassword, confirmPassword } = req.body

    try {
        // invoke resetPassword function in userModel.js
        const response = await User.resetPassword(email, token, newPassword, confirmPassword)  

        res.status(200).json({ response })  
        
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// DELETE a user
const deleteUser = async (req, res) => {
    const { email } = req.body 
  
    try {
        // invoke deleteUser function in userModel.js
        const deletedUser = await User.deleteUser(email)  

        const users = await User.getAllUsers()

        // return the email and skills
        res.status(200).json({ users })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// DELETE many users (more than 1)
const deleteUsers = async (req, res) => {
    const { emails } = req.body

    try {
        // invoke deleteManyUsers function in userModel.js
        const deletedUsers = await User.deleteUsers(emails)  

        const users = await User.getAllUsers()

        // return the email and skills
        res.status(200).json({ users , deletedUsers })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}
 

// UPDATE user project preference
const selectPreference = async (req, res) => {
    const { email, firstChoice, secondChoice, thirdChoice } = req.body

    // track empty fields
    let errorFields = []

    if (!firstChoice) {
        errorFields.push('firstChoice')
    }

    if (!secondChoice) {
        errorFields.push('secondChoice')
    }

    if (!thirdChoice) {
        errorFields.push('thirdChoice')
    }

    if (firstChoice === secondChoice) {
        errorFields.push('firstChoice')
        errorFields.push('secondChoice')
    }

    if (firstChoice === thirdChoice) {
        errorFields.push('firstChoice')
        errorFields.push('thirdChoice')
    }

    if (secondChoice === thirdChoice) {
        errorFields.push('secondChoice')
        errorFields.push('thirdChoice')
    }

    if (firstChoice === secondChoice && secondChoice === thirdChoice) {
        errorFields.push('firstChoice')
        errorFields.push('secondChoice')
        errorFields.push('thirdChoice')
    }
    
    if (errorFields.length > 0) {
        return res.status(400).json({ error: 'Please make sure all fields are selected and that no projects are duplicated', errorFields: errorFields })
    }

    try {
        // invoke selectPreference function in userModel.js
        const user = await User.selectPreference(email, firstChoice, secondChoice, thirdChoice)

        // return the email and skills
        res.status(200).json({ user })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// EXPORT the functions
module.exports = {
    loginUser,
    signupUser,
    getAllUserInfo,
    getUserInfo,
    updateUserInfo,
    updateUserRole,
    addUserSkill,
    updateUserSkill,
    deleteUserSkill,
    changeUserPassword,
    deleteUser,
    deleteUsers,
    selectPreference,
    validateEmail,
    resetPassword
}
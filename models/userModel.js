//==========================//
// MongoDB Schema for Users //
//==========================//

// Personal Details: Name, Contact, Email, (anything else?)
// Login Details: Email, Password
// Other Details: Organisation_ID, Skills, Role

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb
const bcrypt = require('bcrypt'); // hashing passwords
const validator = require('validator') // validates email, password

// create a new schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    contact: {
        type: Number,
        default: null
    },
    email: { // identifier
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique email
    },
    password: {
        type: String,
        required: true // compulsory property i.e. cannot be null
    },
    role: {
        type: String,
        default: "Employee"
    },
    skills: [{ // skills of user - set up to be an array of skills
        skill: String,
        competency: String
    }],
    organisation_id: { // the organisation the user belongs to
        type: String,
        default: null
    },
    current_assignment: { // track which assignment phase the employee is a part of
        type: String, // _id of assignment
        default: null
    },
    firstChoice: { // employee's first choice
        type: String,
        default: ""
    },
    secondChoice: { // employee's second choice
        type: String,
        default: ""
    },
    thirdChoice: { // employee's third choice
        type: String,
        default: ""
    },
    project_assigned: [{ // an array of object including the two fields below
        assignment_id: String, // _id of assignment
        projects: Array // array of project(s) assigned to the user
    }],
    resetPasswordToken: {
        type: String,
        default: ""
    } // token for password reset
}, {timestamps: true}); // datetime created and updated

//=================================================================================================================================//
// SIGNUP USER: static signup method - has to be regular function instead of arrow function because of the usage of 'this' keyword
// 1. VALIDATE whether email of password FIELD IS EMPTY
// 2. VALIDATE the email
// 3. VALIDATE the STRENGTH of the password
// 4. CHECK whether email is UNIQUE
// 5. GENERATE salt and HASH the password
// 6. CREATE a new user document and store it to our database in the schema format specified above
// 7. RETURNS the USER DOCUMENT in the format of the schema
//=================================================================================================================================//
userSchema.statics.signup = async function(name, email, password, confirmPassword, role, organisation_id) {
    /* validation */
    // NAME OR EMAIL OR PASSWORD IS EMPTY
    if (!email || !password || !name) { 
        throw Error('All fields must be filled')
    }

    // ROLE field not selected
    if (!role) {
        throw Error('Please select the role')
    }

    // NOT A VALID EMAIL
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }

    // check whether email exist in the database
    const exists = await this.findOne({ email })

    if (exists) { // DUPLICATE EMAIL - NOT ALLOWED
        throw Error('Email already in use')
    }

    // Passwords do not match 
    if (password !== confirmPassword) {
        throw Error('Passwords do not match')
    }

    // if organisation_id is not provided
    if (role === "Employee" && !organisation_id) { 
         throw Error('Please provide the organisation ID')
    }
    
    if (role === "Admin" && !organisation_id) { 
        throw Error('Please provide the organisation ID')
    } 

    // STRENGTH OF PASSWORD
    // if (!validator.isStrongPassword(password)) {
    //     throw Error('Password not strong enough')
    // }

    
    
    const salt = await bcrypt.genSalt(10) // generate password salt - value determines strength --> default == 10
    const hash = await bcrypt.hash(password, salt) // hash the password

    // save user to the database
    if (role === "Employee" || role === "Admin") {
        const user = await this.create({ name, email, password: hash, role, organisation_id })
    
        console.log(user)

        // returns the user document we just created
        return user
    }

    if (role === "Super Admin") {
        const user = await this.create({ name, email, password: hash, role })
    
        console.log(user)

        // returns the user document we just created
        return user
    }
}

//===============================================================================================================================//
// LOGIN USER: static login method - has to be regular function instead of arrow function because of the usage of 'this' keyword
// 1. VALIDATE whether email of password FIELD IS EMPTY
// 2. FIND whether there is a MATCHING email in our database
// 3. IF a user document is NOT found, means the email does not exist in our database
// 4. IF a user is FOUND, COMPARE the hash of the PASSWORD we receive to the password in our database
// 5. IF passwords hashes MATCH, login SUCCESSFULx
// 6. RETURNS the USER DOCUMENT in the format of the schema
//===============================================================================================================================//

userSchema.statics.login = async function(email, password) {
    // validation - email and/or password empty
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })

    // if user not found
    if (!user) {
        throw Error('Invalid login credentials')
    }

    // if user found - try to match password
    const match = await bcrypt.compare(password, user.password) // (password passed in, password in the db)

    // if no match
    if (!match) {
        throw Error('Invalid login credentials')
    }

    // returns the user document we just created
    return user
}

// static method to retrieve ALL user info EXCEPT password
userSchema.statics.getAllUsers = async function() {
    return this.find().select('-password')
}

// static method to retrieve user info EXCEPT password
userSchema.statics.getOneUser = async function(email) {
    // returns the user document except the password field
    const user = await this.findOne({ email }).select('-password')

    // console.log(user)

    // user DOES NOT exist
    if (!user) {
        throw Error("No such user")
    }

    return user
}

// static method to update user CONTACT info
userSchema.statics.updateInfo = async function(email, contact) { 

    const user = await this.findOne({ email })

    // user DOES NOT exist
    if (!user) {
        throw Error("No such user")
    } 

    // console.log(contact.match(/^[0-9]+$/))
    // console.log(contact)
    // console.log(contact.match(/^[8-9][0-9]*$/))
    // check if contact is null or undefined
    if (contact == null) {
        throw Error("Contact info is empty, please enter your number")
    }

    // validate contact info, if it contains only 8 digits that begins with 8 or 9
    if (contact.match(/^[0-9]+$/) === null || contact.match(/^[8-9][0-9]*$/) === null) {  
        throw Error("Invalid contact info")
    } 
    if (contact.length !== 8) {
        throw Error("Contact info must be 8 digits long")
    }


    // get the user and update contact info
    const updated = await this.findOneAndUpdate({email}, {contact})  

    // return updated user 
    return this.findOne({ email }).select('-password')
}

// static method to update user ROLE
userSchema.statics.updateRole = async function(email, role) {
    const user = await this.findOne({ email })

    // user DOES NOT exist
    if (!user) {
        throw Error("No such user")
    }

    // get the user and update role
    const updated = await this.findOneAndUpdate({email}, {role})

    // return updated user
    return this.findOne({ email }).select('-password')
}

// static method to add new skill
userSchema.statics.addNewSkill = async function(email, skill, competency) {
    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    // search for user by email AND skill name in req.body
    const skillExists = await this.find({ email, 'skills.skill': skill}) // returns an array - have to check based on length whether it exists
    
    // check if skill has already been added
    if (skillExists.length !== 0) {
        throw Error("Skill has already been added")
    }

    // add new skill
    user.skills = [...user.skills, { skill, competency }]
    user.save()
    
    return user
}
 
// static method to update skill
userSchema.statics.updateSkill = async function(email, skills) { 

    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user: ", email)
    } 
 
    const updated = await this.findOneAndUpdate({ email }, {skills})  
     
    return this.findOne({ email })
}

// static method to delete skill
userSchema.statics.deleteSkill = async function(req) {
    const { email, skill } = req.body

    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    const deleteSkill = await this.updateOne({ email }, {
        $pull: { skills: { skill }}
    })

    return user
}

// static method to change password
userSchema.statics.changePassword = async function(email, currentPassword, newPassword, confirmPassword) {
    // search for user by email
    const user = await this.findOne({email}) 

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw Error("All fields must be filled")
    }

    // check if current password matches
    const match = await bcrypt.compare(currentPassword, user.password)
    console.log(match)

    if (!match) {
        throw Error("Invalid current password")
    }
    
    if (newPassword !== confirmPassword) {
        throw Error("Passwords do not match")
    }
    
    // if current password matches, change password
    const salt = await bcrypt.genSalt(10) // generate password salt - value determines strength --> default == 10
    const hash = await bcrypt.hash(newPassword, salt) // hash the password

    // update password
    const update = await this.findOneAndUpdate({ email }, { password: hash })

    return this.findOne({ email })
}

// static method to delete user
userSchema.statics.deleteUser = async function(email) {
     // search for user by email
    const user = await this.findOne({ email })
    
    // check to see whether a user is found
    if (!user) { 
        throw Error("No such user!")
    }
    
    const deleteUser = await this.deleteOne({ email })  

    // return success message after deleting user
    if (deleteUser.acknowledged === true) {
        return "User (" + email + ") deleted!"
    } 
}

// static method to delete many users
userSchema.statics.deleteUsers = async function(emails) {
    // search for user by email
    const user = await this.findOne({ email: emails[0] })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    }

    const deleteUsers = await this.deleteMany({ email: { $in: emails }})
    

    // return success message after deleting user
    if (deleteUsers.acknowledged === true) {
        return "Users deleted!"
    }
}

// static method to validate email
userSchema.statics.validateEmail = async function(email) {
    // search for user by email 
    const user = await this.findOne({ email }) 

    // check to see whether a user is found
    if (!user) { 
        throw Error("Invalid user email")
    } 
 
    return "Email is valid" 
}

// static to update resetPasswordToken when user requests to reset password, and email is validated
userSchema.statics.updateResetPasswordToken = async function(email, resetPasswordToken) {
    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    }

    // update resetPasswordToken
    const update = await this.findOneAndUpdate({ email }, { resetPasswordToken })

    if (!update) {
        throw Error("Unable to update reset password token")
    }
    
    // console.log("Reset password token updated for user: ", email)
    // console.log("updated: ", update)
    return "resetPasswordToken Updated"
}

// static method to reset password
userSchema.statics.resetPassword = async function(email, resetPasswordToken, newPassword, confirmPassword) {
    // search for user by resetPasswordToken
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    }

    if (!resetPasswordToken || !newPassword || !confirmPassword) {
        throw Error("All fields must be filled")
    }

    // check if token matches
    if (user.resetPasswordToken !== resetPasswordToken) {
        // console.log("user.resetPasswordToken: ", user.resetPasswordToken)
        // console.log("resetPasswordToken: ", resetPasswordToken)
        throw Error("Invalid token")
    }

    if (newPassword !== confirmPassword) {
        throw Error("Passwords do not match")
    }

    // if token matches, and passwords match, change password
    const salt = await bcrypt.genSalt(10) // generate password salt - value determines strength --> default == 10
    const hash = await bcrypt.hash(newPassword, salt) // hash the password

    // update password
    const update = await this.findOneAndUpdate({ email }, { password: hash })

    // remove resetPasswordToken
    const removeToken = await this.findOneAndUpdate({ email }, { resetPasswordToken: " " })

    // console.log("Password updated for user: ", removeToken)

    return "Password Reset Successful"
}

// static method to update project preference
userSchema.statics.selectPreference = async function(email, firstChoice, secondChoice, thirdChoice) {
    // search for user by email and update the user's project preference
    const user = await this.findOneAndUpdate({ email }, { firstChoice, secondChoice, thirdChoice })

    // check to see whether a user is found
    if (!user) { 
        throw Error("No such user!")
    }

    return user
}



// EXPORT
module.exports = mongoose.model('User', userSchema) // .model builds out a Collection

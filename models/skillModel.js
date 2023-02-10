//===========================//
// MongoDB Schema for Skills //
//===========================//

// im thinking we allow each organisation to add the skills themselves
// so that we do not limit them in the naming of the skills etc. and then 
// attach those skills to the projects that they create.
// BUT please do bring up any ideas you have

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const skillSchema = new Schema({
    skillName: {
        type: String, // e.g. "Java", "C++", "NodeJS"
        required: true, // compulsory property i.e. cannot be null
        unique: true
    },
    organisation: { // track who added the skills
        type: String
    }
});


// EXPORT
module.exports = mongoose.model('Skill', skillSchema) // .model builds out a Collection

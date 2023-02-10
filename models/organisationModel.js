//=================================//
// MongoDB Schema for Organisation //
//=================================//

// 

// imports
const { startOfMinute } = require('date-fns');
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const organisationSchema = new Schema({
    orgname: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique organisation name(?)
    },
    organisation_id: { // some identifier to be assigned to employees 
        type: String,
        default: "",
        unique: true // unique organisation id
    },
    detail: {
        type: String,
        required: true //summary of organisation, compulsory property i.e. cannot be null
    },
    organisation_skills: [{
        skillName: String
    }],
    created_by: { // who created the project listing
        type: String,
        required: true
    }
}, {timestamps: true}); // datetime created and updated

// static method to get all organisation skills
organisationSchema.statics.getOrganisationSkills = async function(organisation_id) { 

    const org = await this.findOne({organisation_id}, {organisation_skills: 1}) 

    if (!org) {
        throw new Error('No such organisation')
    }

    return org.organisation_skills
}

// static method to update organisation skills 
organisationSchema.statics.updateOrganisationSkills = async function(organisation_id, organisation_skills) { 
    console.log("org skills: ", organisation_skills);

    const org = await this.findOneAndUpdate({organisation_id}, {organisation_skills});
    

    if (!org) {
        throw new Error('No such organisation')
    }

    return org.organisation_skills
}

// EXPORT
module.exports = mongoose.model('Organisation', organisationSchema) // .model builds out a Collection

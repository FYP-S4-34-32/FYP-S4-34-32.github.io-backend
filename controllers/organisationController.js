//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const Organisation = require('../models/organisationModel') // MongoDB model
const Skill = require('../models/skillModel') // Skill model
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all organisations
const getOrganisations = async (req, res) => {
    const organisations = await Organisation.find({}).sort({createdAt: -1}) // descending order

    res.status(200).json(organisations)
}

// GET a single organisation
const getSingleOrganisation = async (req, res) => {
    // get id from address bar
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Organisation ID'})
    }

    const organisation = await Organisation.findById(id)

    // if document does not exist
    if (!organisation) {
        return res.status(404).json({error: "No such organisation"});
    }

    // document found
    res.status(200).json(organisation)
}

// CREATE new organisation
const createOrganisation = async (req, res) => {
    const { orgname, organisation_id, detail } = req.body
    // const { orgName, code, detail } = req.body

    const skills = await Skill.find({});

    let emptyFields = []
  
    if (!orgname) {
      emptyFields.push('orgname')
    }
    if (!organisation_id) {
        emptyFields.push('code')
      }
    if (!detail) {
      emptyFields.push('detail')
    }
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all fields', emptyFields })
    }
    
    // add to the database
    try {

        const created_by = req.user.name // access to this is from the middleware requireAuthentication.js return value

        const organisation_skills = skills

      const organisation = await Organisation.create({ orgname, organisation_id, detail, created_by,  organisation_skills })
    //   const organisation = await Organisation.create({ orgName, code, detail, created_by })

      res.status(200).json(organisation)

    } catch (error) {

      res.status(400).json({ error: error.message })

    }
}

// DELETE an organisation
const deleteOrganisation = async (req, res) => {
    const { id } = req.params

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid Organisation ID'})
    }
  
    const organisation = await Organisation.findOneAndDelete({_id: id})
  
    // check to see whether a project is found
    if (!organisation) {
      return res.status(404).json({error: "No such organisation"});
    } 
  
    // if project is found
    res.status(200).json(organisation);
}

const updateOrganisationSkills = async (req, res) => {
    const {organisation_id, organisation_skills} = req.body

    try {
        // Invoke static method in organisationModel.js to update organisation skills
        const results = await Organisation.updateOrganisationSkills(organisation_id, organisation_skills);

        res.status(200).json(results)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getOrganisationSkills = async (req, res) => { 
    const { organisation_id } = req.body

    try {
        // Invoke static method in organisationModel.js to get all skills defined for an organisation
        const organisation_skills = await Organisation.getOrganisationSkills(organisation_id);

        res.status(200).json(organisation_skills)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//export functions
module.exports = {
    getOrganisations,
    getSingleOrganisation,
    createOrganisation,
    deleteOrganisation,
    getOrganisationSkills,
    updateOrganisationSkills
}
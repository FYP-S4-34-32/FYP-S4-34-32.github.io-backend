//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const Skill = require('../models/skillModel') // MongoDB model created in skillModel.js in the models folder
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all skills
const getSkills = async (req, res) => {
    const skills = await Skill.find({})

    res.status(200).json(skills)
}

// POST a new skill
const addSkill = async (req, res) => {
    // const { skillName, organisation } = req.body
    const { skillName } = req.body

    try {

        // const skill = await Skill.create({ skillName, organisation })
        const skill = await Skill.create({ skillName })

        res.status(200).json(skill)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}

// DELETE a skill
const deleteSkill = async (req, res) => {
    const { id } = req.params
    // const { skillName } = req.body

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" }) 
    }

    try {

        const skill = await Skill.findOneAndDelete({ _id: id })

        res.status(200).json(skill.skillName + ' deleted')

    } catch (error) {

        res.status(400).json({ error: "No such skill" })

    }
}


// export functions
module.exports = {
    getSkills,
    addSkill,
    deleteSkill
}
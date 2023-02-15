//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const Project = require('../models/projectModel') // MongoDB model created in projectModel.js in the models folder
const Assignment = require('../models/assignmentModel')
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all projects
const getProjects = async (req, res) => {
    const organisation_id = req.user.organisation_id

    const projects = await Project.find({organisation_id}).sort({createdAt: -1}) // descending order

    res.status(200).json(projects)
}


// GET a single project
const getSingleProject = async (req, res) => {
    // get id from address bar
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Project ID'})
    }

    const project = await Project.findById(id)

    // if document does not exist
    if (!project) {
        return res.status(404).json({error: "No such project"});
    }

    // document found
    res.status(200).json(project)
}


// CREATE new project
const createProject = async (req, res) => {
    const { title, description, requirements, projectSkills, projectCompetency, threshold } = req.body

    const projectSkillsWithoutDummy = projectSkills.filter(p => !p.includes("dummy")) // remove dummy values from projectSkills array
    const projectCompetencyWithoutDummy = projectCompetency.filter(p => !p.includes("dummy")) // remove dummy values from projectCompetency array

    let emptyFields = []
  
    if (!title) {
      emptyFields.push('title')
    }
    if (!description) {
      emptyFields.push('description')
    }
    if (!requirements) {
        emptyFields.push('requirements')
      }
    if (projectSkills.length === 0 || projectCompetency.length === 0) {
        emptyFields.push('noSkill')
    }
    if (projectSkillsWithoutDummy.length === 0 || projectCompetencyWithoutDummy.length === 0) {
        emptyFields.push('skillError')
    }
    if (!threshold || Number(threshold) === 0) {
        emptyFields.push('threshold')
    }
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all fields', emptyFields })
    }

    /* validating skills and competency */
    // skills or competency empty while the other is selected
    for (var i = 0; i < projectSkills.length; i++) {
        if ((projectSkills[i] === "dummy" && projectCompetency[i] !== "dummy") || (projectSkills[i] !== "dummy" && projectCompetency[i] === "dummy")) {

            emptyFields.push("skillError")

            return res.status(400).json({ error: "Please ensure a skill and competency level pair is selected", emptyFields })
        }
    }

    // check for duplicated entries
    const unique = Array.from(new Set(projectSkillsWithoutDummy)) // array of unique projectSkills values

    // compare the length of projectSkills array with the dummy values removed to the length of the unique array -> equal length = no duplicates | length unequal = duplicate entries found
    if (projectSkillsWithoutDummy.length !== unique.length) {

        emptyFields.push("skillError")

        return res.status(400).json({ error: "Duplicated skill entries are found", emptyFields })
    }

    // create the project skills array
    const skills = []

    for (var i = 0; i < unique.length; i++) {
        const skill = unique[i]
        const competency = projectCompetencyWithoutDummy[i]
        skills[i] = {skill, competency}
        console.log(skills)
    }
  
    // add to the database
    try {

        // access from the middleware requireAuthentication.js return value
        const organisation_id = req.user.organisation_id
        const created_by = req.user.name

        // create project
        const project = await Project.create({ organisation_id, title, description, requirements, skills, threshold, created_by })

        res.status(200).json(project)

    } catch (error) {

        res.status(400).json({ error: error.message })

    }
}


// DELETE a project
const deleteProject = async (req, res) => {
    const { id } = req.params

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid Project ID'})
    }
  
    const project = await Project.findOneAndDelete({_id: id})

    if (project.assignment !== null) {
        const assignment = await Assignment.findOne({ _id: project.assignment })

        const { projects } = assignment;

        const index = projects.indexOf(project.title)

        projects.splice(index, 1)

        assignment.projects = projects
        await assignment.save()
    }
  
    // check to see whether a project is found
    if (!project) {
      return res.status(404).json({error: "No such project"});
    } 
  
    // if project is found
    res.status(200).json(project);
}



// UPDATE a project
const updateProject = async (req, res) => {
    const { id } = req.params // grab id from the address bar or request

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Project ID" }) 
    }

    const { title, description, requirements, projectSkills, projectCompetency, threshold } = req.body

    const projectSkillsWithoutDummy = projectSkills.filter(p => !p.includes("dummy")) // remove dummy values from projectSkills array
    const projectCompetencyWithoutDummy = projectCompetency.filter(p => !p.includes("dummy")) // remove dummy values from projectCompetency array

    let emptyFields = []
  
    if (!title || title.trim() === "") {
      emptyFields.push('title')
    }
    if (!description || description.trim() === "") {
      emptyFields.push('description')
    }
    if (!requirements || requirements.trim() === "") {
        emptyFields.push('requirements')
      }
    if (projectSkills.length === 0 || projectCompetency.length === 0) {
        emptyFields.push('noSkill')
    }
    if (projectSkillsWithoutDummy.length === 0 || projectCompetencyWithoutDummy.length === 0) {
        emptyFields.push('skillError')
    }
    if (!threshold || Number(threshold) === 0) {
        emptyFields.push('threshold')
    }
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all fields', emptyFields })
    }

    /* validating skills and competency */
    // skills or competency empty while the other is selected
    for (var i = 0; i < projectSkills.length; i++) {
        if ((projectSkills[i] === "dummy" && projectCompetency[i] !== "dummy") || (projectSkills[i] !== "dummy" && projectCompetency[i] === "dummy")) {

            emptyFields.push("skillError")

            return res.status(400).json({ error: "Please ensure a skill and competency level pair is selected", emptyFields })
        }
    }

    // check for duplicated entries
    const unique = Array.from(new Set(projectSkillsWithoutDummy)) // array of unique projectSkills values

    // compare the length of projectSkills array with the dummy values removed to the length of the unique array -> equal length = no duplicates | length unequal = duplicate entries found
    if (projectSkillsWithoutDummy.length !== unique.length) {

        emptyFields.push("skillError")

        return res.status(400).json({ error: "Duplicated skill entries are found", emptyFields })
    }

    // create the project skills array
    const skills = []

    for (var i = 0; i < unique.length; i++) {
        const skill = unique[i]
        const competency = projectCompetencyWithoutDummy[i]
        skills[i] = {skill, competency}
        console.log(skills)
    }

    // get the document
    const project = await Project.findOneAndUpdate({ _id: id }, {
        title, description, requirements, skills, threshold
    }) // store the response of findOneAndUpdate() into project variable

    // project DOES NOT exist
    if (!project) {
        return res.status(404).json({ error: "No such project", emptyFields })
    }

    // project EXISTS
    res.status(200).json(project)
}

// POST project skills
const addProjectSkills = async (req, res) => {
    
    try {
        // invoke addNewSkill function in projectModel.js
        const project = await Project.addNewSkill(req)

        const title = project.title
        const skills = project.skills

        // return the email and skills
        res.status(200).json({ title, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }

}


// UPDATE project skills
const updateProjectSkills = async (req, res) => {

    try {
        // invoke updateSkill function in projectModel.js
        const project = await Project.updateSkill(req)

        const title = project.title
        const skills = project.skills

        // return the email and skills
        res.status(200).json({ title, skill })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }

}

// DELETE project skills
const deleteProjectSkills = async (req, res) => {
    
    try {
        // invoke deleteSkill function in projectModel.js
        const project = await Project.deleteSkill(req)

        // return the email and skills
        res.status(200).json({ project })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}



// export functions
module.exports = {
    getProjects,
    getSingleProject,
    createProject,
    deleteProject,
    updateProject,
    addProjectSkills,
    updateProjectSkills,
    deleteProjectSkills
}
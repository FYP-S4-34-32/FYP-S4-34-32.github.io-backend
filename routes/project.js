//===========================================================//
// File which handles all the request to /api/project routes //
//===========================================================//

// imports
const express = require('express')

/* ============================================================================== *\
|   import controller functions from projectController.js in the controllers       |
|   folder these functions will be invoked and handled in the controller file      |
|   whenever the routes are requested.                                             |
\* ============================================================================== */
const { createProject, getProjects, getSingleProject, deleteProject, updateProject, addProjectSkills, updateProjectSkills, deleteProjectSkills } = require('../controllers/projectController')
const requireAuthentication = require('../middleware/requireAuthentication')

// invoke express router object
const router = express.Router()

// fire authentication check before moving on to the remaining routes
router.use(requireAuthentication)

// GET all projects @ /api/project/
router.get('/', getProjects);

// GET a single project @ /api/project/:id
router.get('/:id', getSingleProject);

// POST a new project @ /api/project/createproject
router.post('/createproject', createProject); // ------------------------> Should require a change in url if we were to separate the project listings and project creation

// DELETE a project @ /api/project/:id
router.delete('/:id', deleteProject);

// UPDATE a new project @ /api/project/:id
router.patch('/editproject/:id', updateProject);

// POST project skills @ /api/project/skills/:id
router.post('/skills/:id', addProjectSkills);

// PATCH project skills @ /api/project/skills/:id
router.patch('/skills/:id', updateProjectSkills)

// DELETE project skills @ /api/project/skills/:id
router.delete('/skills/:id', deleteProjectSkills)

// EXPORT router
module.exports = router
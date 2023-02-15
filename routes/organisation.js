//================================================================//
// File which handles all the request to /api/organisation routes //
//================================================================//

// imports
const express = require('express')

/* =================================================================================== *\
|     import controller functions from organisationController.js in the controllers     |
|     folder these functions will be invoked and handled in the controller file         |
|     whenever the routes are requested.                                                |
\* =================================================================================== */
const { getOrganisations, getSingleOrganisation, createOrganisation, deleteOrganisation, getOrganisationSkills, updateOrganisationSkills} = require('../controllers/organisationController')
const requireAuthentication = require('../middleware/requireAuthentication')

// invoke express router object
const router = express.Router()

// fire authentication check before moving on to the remaining routes
router.use(requireAuthentication)

// GET all organisations @ /api/organisation/
router.get('/', getOrganisations);

// GET a single organisation @ /api/organisation/:id
router.get('/:id', getSingleOrganisation);

// POST a new project @ /api/organisation/createorganisation
router.post('/createorganisation', createOrganisation); // ------------------------> Should require a change in url if we were to separate the project listings and project creation

// DELETE an organisation @ /api/organisation/:id
router.delete('/:id', deleteOrganisation);

// GET all organisation skills @ /api/organisation/:id/skills
router.post('/getOrganisationSkills', getOrganisationSkills);

// POST an updated array of organisation skills @ /api/organisation/updateOrganisationSkill
router.post('/updateOrganisationSkils', updateOrganisationSkills);

// UPDATE a new project @ /api/project/:id
//router.patch('/:id', updateOrganisation);

// EXPORT router
module.exports = router
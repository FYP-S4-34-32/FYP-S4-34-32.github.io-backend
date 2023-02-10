//========================================================//
// File which handles all the request to /api/user routes //
//========================================================//

// imports
const express = require('express')

/* =============================================================================== *\
|   import controller functions from skillController.js in the controllers folder   |
|   these functions will be invoked and handled in the controller file whenever     |
|   the routes are requested.                                                       |
\* =============================================================================== */
const { getSkills, addSkill, deleteSkill } = require('../controllers/skillController')
const requireAuthentication = require('../middleware/requireAuthentication')

// invoke express router object
const router = express.Router()

// fire authentication check before moving on to the remaining routes
// router.use(requireAuthentication)

// GET all skills @ /api/skill/
router.get('/', getSkills)

// POST a new skill @ /api/skill/
router.post('/', addSkill)

// DELETE a skill @ /api/skill/
router.delete('/:id', deleteSkill)



// EXPORT router
module.exports = router
//=======================================//
// MongoDB Schema for Project Assignment //
//=======================================//

// 

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    title: { // identifier
        type: String,
        required: true,
        unique: true
    },
    organisation_id: { // assignment object tied to each unique organisation
        type: String,
        required: true, // compulsory property i.e. cannot be null
    },
    start_date: {
        type: Date,
        default: Date.now() // when the object is created
    },
    end_date: {
        type: Date,
        default: function() { // 7 days after the object is created
            return new Date(this.start_date.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
    },
    projects: [{ // projects that are a part of this assignment phase
        type: String, // project title
    }],
    threshold: { // number of projects each employee can take
        type: Number,
        required: true
    },
    employees: [{ // employees who are a part of this assignment phase
        name: String, // employee name
        email: String // employee email
    }],
    employee_got_first_choice: { // number of employees who are assigned to their first choice project
        type: Number
    },
    employee_got_second_choice: { // number of employees who are assigned to their second choice project
        type: Number
    },
    employee_got_third_choice: { // number of employees who are assigned to their third choice project
        type: Number
    },
    employee_got_not_selected: { // number of employees who are assigned to projects they did not select as any of their preference
        type: Number
    },
    employee_without_project: { // number of number of employees who are not assigned to any projects
        type: Number
    },
    project_filled: { // number of projects that have been assigned to their respective threshold
        type: Number
    },
    project_not_filled: { // number of projects that have been assigned less than its respective threshold
        type: Number
    },
    project_without_employee: { // number of projects that have not been assigned any employees
        type: Number
    },
    created_by: { // who created the assignment phase - admin email
        type: String,
        required: true
    },
    active: { // check whether assignment phase is still active or not
        type: Boolean,
        default: false // false by default - prep phase before making it active
    }
}, {timestamps: true}); // datetime created and updated


// EXPORT
module.exports = mongoose.model('Assignment', assignmentSchema) // .model builds out a Collection

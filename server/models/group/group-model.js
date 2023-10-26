const mongoose = require('mongoose');

// Define the database model
const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String
    },
    groupMembers: [],
    isDeleted: {
        type: Boolean
    }
},{
    versionKey: false
});

const Group = module.exports = mongoose.model('group', GroupSchema);
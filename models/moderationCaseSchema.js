const mongoose = require('mongoose')

const moderationCaseSchema = new mongoose.Schema({
    guildId: {type: String, required: true},
    userId: {type: String, required: true},
    moderatorId: {type: String, required: true},
    type: {type: String, required: true, enum: ['warn', 'kick', 'ban']},
    reason: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const moderationCaseModel = mongoose.model("moderationCase", moderationCaseSchema)

module.exports = {moderationCaseModel}

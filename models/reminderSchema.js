const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    guildId: {type: String, required: true},
    channelId: {type: String, required: true},
    message: {type: String, required: true},
    remindAt: {type: Date, required: true}
})

const reminderModel = mongoose.model("reminder", reminderSchema)

module.exports = {reminderModel}
